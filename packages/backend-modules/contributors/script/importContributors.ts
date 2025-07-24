#!/usr/bin/env node
import yargs from 'yargs'
import * as fs from 'fs'
import { PgDb } from '@orbiting/backend-modules-base/lib'
import { slugify } from '@orbiting/backend-modules-utils'
import { S3Client, CopyObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuid } from 'uuid'

import { ContributorsRepo } from '../lib/ContributorsRepo'
import { Contributor } from '../types'

import env from '@orbiting/backend-modules-env'
env.config()

interface Args {
  file: string
}

function loadFile(path: string): Contributor[] {
  try {
    const content = fs.readFileSync(path, 'utf8')

    const contributors: Contributor[] = JSON.parse(content)
    console.log(`${contributors.length} contributors successfully loaded`)
    return contributors
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(`Error: File "${path}" not found`)
    } else {
      console.error(`Error loading data: ${error}`)
    }
    throw error
  }
}

function extractS3KeyFromUrl(url: string, bucket: string): string | undefined {
  try {
    const urlObject = new URL(url)
    let pathname = urlObject.pathname

    if (pathname.startsWith('/s3/')) {
      pathname = pathname.substring(4)
    }
    if (pathname.startsWith(`${bucket}`)) {
      pathname = pathname.substring(bucket.length)
    }
    if (pathname.startsWith('/')) {
      pathname = pathname.substring(1)
    }

    return decodeURIComponent(pathname)
  } catch (e) {
    console.error(`Could not convert url ${url} to S3 path`)
    throw e
  }
}

async function copyProfileImage(
  imagePath: string,
): Promise<string | undefined> {
  const {
    AWS_S3_BUCKET,
    AWS_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    ASSETS_SERVER_BASE_URL,
  } = process.env

  // Validate all required environment variables
  const missingVars = []
  if (!AWS_REGION) missingVars.push('AWS_REGION')
  if (!AWS_S3_BUCKET) missingVars.push('AWS_S3_BUCKET')
  if (!AWS_ACCESS_KEY_ID) missingVars.push('AWS_ACCESS_KEY_ID')
  if (!AWS_SECRET_ACCESS_KEY) missingVars.push('AWS_SECRET_ACCESS_KEY')
  if (!ASSETS_SERVER_BASE_URL) missingVars.push('ASSETS_SERVER_BASE_URL')

  if (missingVars.length > 0) {
    console.error(
      `Could not upload contributor image, missing environment variables: ${missingVars.join(
        ', ',
      )}`,
    )
    throw new Error('Error while uploading contributor image')
  }

  try {
    const s3Client = new S3Client({
      region: AWS_REGION as string,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID as string,
        secretAccessKey: AWS_SECRET_ACCESS_KEY as string,
      },
    })

    const fileId = uuid()
    const fileName = `${fileId}.jpeg`
    const s3Path = `publikator/author-images/${fileName}`

    // only needed for testing, otherwise it should be AWS_S3_BUCKET everywhere
    const sourceBucket = 'republik-assets'

    const sourceKey = extractS3KeyFromUrl(imagePath, sourceBucket)

    const copyCommand = new CopyObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: s3Path,
      CopySource: `/${sourceBucket}/${sourceKey}`,
    })

    await s3Client.send(copyCommand)

    // Generate public URL
    const publicUrl = `${ASSETS_SERVER_BASE_URL}/s3/${AWS_S3_BUCKET}/${s3Path}`

    return publicUrl
  } catch (error) {
    console.error('Error uploading author profile image', error)
  }
}

async function main(argv: Args) {
  const filename = argv.file
  const contributors: Contributor[] = loadFile(filename)

  const pgdb = await PgDb.connect({
    applicationName: 'Import script for contributors',
  })
  const repo = new ContributorsRepo(pgdb)

  const userIds = contributors
    .map((c) => c.user_id)
    .filter((id) => !!id) as string[]

  // find existing contributors
  const contributorNames = contributors.map((c) => c.name)
  const contributorsinDb = await repo.findContributorsByName(contributorNames)

  let newContributors: Contributor[]
  let contributorsToPossiblyUpdate: Contributor[]

  if (contributorsinDb?.length) {
    const namesInDb = contributorsinDb.map((c) => c.name)
    newContributors = contributors.filter((c) => !namesInDb.includes(c.name))

    // find existing contributors but with missing userId, where the same name with a userID exsists now
    contributorsToPossiblyUpdate = contributors.filter(
      (c) =>
        c.user_id &&
        !!contributorsinDb.find((cdb) => cdb.name === c.name && !cdb.user_id),
    )
  } else {
    newContributors = contributors
    contributorsToPossiblyUpdate = []
  }

  // log contributors which might need an update
  if (contributorsToPossiblyUpdate.length) {
    console.log(
      `there are ${contributorsToPossiblyUpdate.length} contributors in the DB that might be possible to connect with userIds:`,
    )
    console.log(contributorsToPossiblyUpdate)
  }

  if (!newContributors?.length) {
    console.log('No new contributors to update, not doing anything')
    await PgDb.disconnect(pgdb)
    return
  }

  // load profile data from db

  const userRows = await repo.findUsersById(userIds)

  if (userRows?.length) {
    const userMap = new Map(userRows.map((user) => [user.id, user]))

    await Promise.all(
      newContributors.map(async (c) => {
        if (c.user_id) {
          const user = userMap.get(c.user_id)

          if (!user) {
            console.log(`no user found for id ${c.user_id}, name ${c.name}`)
            c.user_id = undefined
            return
          }

          // profile info
          c.bio = user.biography || undefined
          c.prolitteris_id = user.prolitterisId || undefined
          c.prolitteris_first_name = user.firstName
          c.prolitteris_last_name = user.lastName

          // copy image to right folder
          if (user.portraitUrl) {
            c.image = await copyProfileImage(user.portraitUrl)
          }

          if (user.gender) {
            switch (user.gender) {
              case 'weiblich':
                c.gender = 'f'
                break
              case 'männlich':
                c.gender = 'm'
                break
              default:
                c.gender = 'd'
            }
          }
        }
      }),
    ).catch((error) => console.error('error while adding profile data', error))
  }

  // try to find gender in gsheet data if not already filled in
  const authorGenderData = await repo.getGsheetAuthorGenderData()
  const authorGenderDataMap = new Map(
    authorGenderData.map((d) => [d.name, d.gender]),
  )
  const gendersToCheck: Contributor[] = []
  newContributors.forEach((c) => {
    if (!c.gender) {
      const gender = authorGenderDataMap.get(c.name)
      // gender is na for n and b, otherwise m, f, or undefined
      if (gender === 'n' || gender === 'b') {
        c.gender = 'na'
        gendersToCheck.push(c)
      } else {
        c.gender = gender
      }
    }
  })

  if (gendersToCheck.length) {
    console.log(
      `There are ${gendersToCheck.length} contributors with n or b genders that were saved as na: `,
    )
    console.log(gendersToCheck)
  }

  // insert into db

  // check and update slugs
  const newSlugs = newContributors.map((c) => c.slug)
  const slugsToUpdate = await repo.findExistingSlugs(newSlugs)
  if (slugsToUpdate?.length) {
    await Promise.all(
      contributors
        .filter((c) => slugsToUpdate.includes(c.slug))
        .map(async (c) => {
          const baseSlug = slugify(c.name)
          const newSlug = await repo.findUniqueSlug(baseSlug)
          c.slug = newSlug
          console.log(newSlug)
        }),
    ).catch((error) => console.error('error while checking slugs', error))
  }

  const inserted = await repo.insertContributors(newContributors)
  console.log(`successfully inserted ${inserted.length} contributors`)

  await PgDb.disconnect(pgdb)
}

const argv = yargs.option('file', {
  alias: 'f',
  type: 'string',
  demandOption: true,
  description: 'Path to the contributors JSON file',
}).argv as Args

main(argv)
