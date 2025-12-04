#!/usr/bin/env node
import yargs from 'yargs'
import * as fs from 'fs'
import { PgDb } from '@orbiting/backend-modules-base/lib'
import slugify from 'slugify'
import { S3Client, CopyObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuid } from 'uuid'

import { ContributorsRepo } from '../lib/ContributorsRepo'
import { Contributor, ContributorGender, GsheetAuthorGender } from '../types'
import { UserRow } from '@orbiting/backend-modules-types'

import env from '@orbiting/backend-modules-env'
env.config()

interface Args {
  filename: string
  save: boolean
}

slugify.extend({
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  '.': '',
})

function modifiedSlugify(text: string) {
  return slugify(text.toLowerCase())
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
    if (pathname.startsWith('/')) {
      pathname = pathname.substring(1)
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

    const sourceKey = extractS3KeyFromUrl(imagePath, AWS_S3_BUCKET as string)

    const copyCommand = new CopyObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: s3Path,
      CopySource: `/${AWS_S3_BUCKET}/${sourceKey}`,
    })

    await s3Client.send(copyCommand)

    // Generate public URL
    const publicUrl = `${ASSETS_SERVER_BASE_URL}/s3/${AWS_S3_BUCKET}/${s3Path}`

    return publicUrl
  } catch (error) {
    console.error('Error uploading author profile image', error)
  }
}

async function filterForExistingContributors(
  contributors: Contributor[],
  contributorsinDb: Contributor[],
): Promise<{
  contributorsToPossiblyUpdate: Contributor[]
  newContributors: Contributor[]
}> {
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

  if (!newContributors?.length) {
    console.log('No new contributors to update, not doing anything')
    return {
      contributorsToPossiblyUpdate,
      newContributors: [],
    }
  }
  return {
    contributorsToPossiblyUpdate,
    newContributors,
  }
}

async function associateContributorWithProfileData(
  userMap: Map<string, UserRow>,
  contributor: Contributor,
): Promise<Contributor> {
  const user = userMap.get(contributor.user_id as string)

  if (!user) {
    console.log(
      `no user found for id ${contributor.user_id}, name ${contributor.name}`,
    )
    contributor.user_id = undefined
    return contributor
  }

  // profile info
  contributor.bio = user.biography || undefined
  contributor.prolitteris_id = user.prolitterisId || undefined
  if (user.prolitterisId) {
    contributor.prolitteris_first_name = user.firstName
    contributor.prolitteris_last_name = user.lastName
  }

  // copy image to right folder
  if (user.portraitUrl) {
    contributor.image = await copyProfileImage(user.portraitUrl)
  }

  if (user.gender) {
    switch (user.gender) {
      case 'weiblich':
        contributor.gender = 'f'
        break
      case 'männlich':
        contributor.gender = 'm'
        break
      default:
        contributor.gender = 'd'
    }
  }

  return contributor
}

function getGenderFromGsheetData(
  c: Contributor,
  authorGenderDataMap: Map<string, GsheetAuthorGender>,
): ContributorGender | undefined {
  const gender = authorGenderDataMap.get(c.name)
  // gender is na for n and b, otherwise m, f, or undefined
  if (gender === 'n' || gender === 'b') {
    return 'na'
  } else if (['m', 'f', undefined].includes(gender)) {
    return gender
  } else {
    console.error(
      `Unknown gender entry found in gsheet author gender data: ${c.name} - ${gender}`,
    )
    return 'na'
  }
}

function findDuplicates(array: string[]): string[] {
  const checked = new Set<string>()
  const duplicates = new Set<string>

  array.forEach((item) => {
    if (checked.has(item)) {
      duplicates.add(item)
    } else {
      checked.add(item)
    }
  })
  return Array.from(duplicates)
}

type ContributorsForImport = {
  contributorsToPossiblyUpdate: Contributor[]
  gendersToCheck: Contributor[]
  contributorsWithUpdatedSlugs: Contributor[]
  newContributors: Contributor[]
}

async function prepareContributorsForImport(
  repo: ContributorsRepo,
  contributors: Contributor[],
): Promise<ContributorsForImport> {
  // find existing contributors
  const contributorNames = contributors.map((c) => c.name)
  const contributorsinDb = await repo.findContributorsByName(contributorNames)

  const { contributorsToPossiblyUpdate, newContributors } =
    await filterForExistingContributors(contributors, contributorsinDb)

  // load profile data from db
  const userIds = contributors
    .map((c) => c.user_id)
    .filter((id) => !!id) as string[]
  const userRows = await repo.findUsersById(userIds)

  if (userRows?.length) {
    const userMap = new Map(userRows.map((user) => [user.id, user]))
    await Promise.all(
      newContributors.map(async (c) => {
        if (c.user_id) {
          return associateContributorWithProfileData(userMap, c)
        }
      }),
    ).catch((error) => {
      console.error(
        'Error while adding user profile data to contributors',
        error,
      )
      throw error
    })
  }

  // try to find gender in gsheet data if not already filled in
  const authorGenderData = await repo.getGsheetAuthorGenderData()
  const authorGenderDataMap = new Map(
    authorGenderData.map((d) => [d.name, d.gender]),
  )

  newContributors.forEach((c) => {
    if (!c.gender) {
      c.gender = getGenderFromGsheetData(c, authorGenderDataMap)
    }
  })
  const gendersToCheck: Contributor[] = newContributors.filter(
    (c) => c.gender === 'na',
  )

  // check and update slugs
  const newSlugs = newContributors.map((c) => c.slug)
  const existingSlugsInDb = await repo.findExistingSlugs(newSlugs)
  const otherDuplicateSlugs = findDuplicates(newSlugs)
  const slugsToUpdate = existingSlugsInDb.concat(otherDuplicateSlugs)
  const contributorsWithUpdatedSlugs: Contributor[] = []
  if (slugsToUpdate?.length) {
    await Promise.all(
      newContributors
        .filter((c) => slugsToUpdate.includes(c.slug))
        .map(async (c) => {
          const baseSlug = modifiedSlugify(c.name)
          const newSlug = await repo.findUniqueSlug(baseSlug, null, newSlugs)
          newSlugs.push(newSlug)
          c.slug = newSlug
          contributorsWithUpdatedSlugs.push(c)
        }),
    ).catch((error) => {
      console.error('error while checking slugs', error)
      throw error
    })
  }

  return {
    contributorsToPossiblyUpdate,
    gendersToCheck,
    contributorsWithUpdatedSlugs,
    newContributors,
  }
}

/*
 * Run this script after running extractContributorsFromElastic, using the same filename argument,
 * and after manually adjusting those with errors (in the filename.json file).
 * This imports the found contributors from elastic into the publikator.contributors table, using the data
 * from the user table and from the gsheets -> authors gender field.
 * It logs contributors that might have to be manually checked and corrected, 
 * and also saves them to imported-to-check-[filename].json and all imported contributors to imported-[filename].json if the --save option is set.
 * To run this script, either use node-ts or run the js version of this file:
 * ❯ node build/script/importContributors.js --filename test --save true
 */
async function main(argv: Args) {
  const filename = argv.filename
  const contributors: Contributor[] = loadFile(`${filename}.json`)

  const pgdb = await PgDb.connect({
    applicationName: 'Import script for contributors',
  })
  const repo = new ContributorsRepo(pgdb)

  const {
    contributorsToPossiblyUpdate,
    gendersToCheck,
    contributorsWithUpdatedSlugs,
    newContributors,
  } = await prepareContributorsForImport(repo, contributors)

  // log contributors which might need an update
  if (contributorsToPossiblyUpdate.length) {
    console.log(
      `there are ${contributorsToPossiblyUpdate.length} contributors in the DB that might be possible to connect with userIds:`,
    )
    console.log(JSON.stringify([...contributorsToPossiblyUpdate]))
  }

  // log contributors with genders to check
  if (gendersToCheck?.length) {
    console.log(
      `There are ${gendersToCheck.length} contributors with n or b genders that were saved as na: `,
    )
    console.log(JSON.stringify([...gendersToCheck]))
  }

  // log contributors with updated slugs
  if (contributorsWithUpdatedSlugs?.length) {
    console.log(
      `Duplicate slugs found and updated for ${contributorsWithUpdatedSlugs.length} contributors:`,
    )
    console.log(JSON.stringify([...contributorsWithUpdatedSlugs]))
  }

  // insert new contributors into the db
  if (newContributors?.length) {
    const inserted = await repo.insertContributors(newContributors)
    console.log(`successfully inserted ${inserted.length} contributors`)
  }

  // save contributors that should be checked to file:
  if (argv.save) {
    try {
      const contributorsToCheck = (contributorsToPossiblyUpdate || []).concat(
        gendersToCheck || [],
        contributorsWithUpdatedSlugs || [],
      )
      await fs.writeFile(
        `imported-to-check-${filename}.json`,
        JSON.stringify(contributorsToCheck, null, 2),
        'utf8',
        (error) => {
          if (error) {
            console.error(
              `Error while writing imported-to-check-${filename}.json`,
            )
          }
        },
      )

      console.log(`successfully saved to imported-to-check-${filename}.json`)

      await fs.writeFile(
        `imported-${filename}.json`,
        JSON.stringify(newContributors, null, 2),
        'utf8',
        (error) => {
          if (error) {
            console.error(`Error while writing imported-${filename}.json`)
          }
        },
      )

      console.log(`successfully saved to imported-${filename}.json`)
    } catch (error) {
      console.error(
        'Error while trying to save imported contributors as file',
        error,
      )
    }
  }

  await PgDb.disconnect(pgdb)
}

if (require.main === module) {
  const argv = yargs.option('filename', {
    alias: 'f',
    type: 'string',
    demandOption: true,
    description: 'Path to the contributors JSON file',
  })
  .option('save', {
    alias: 's',
    type: 'boolean',
    default: false,
    description: 'Save the imported contributors and those that need manual checking to json files'
  })
  .argv as Args

  main(argv)
}

export const importContributorsFunctions = {
  extractS3KeyFromUrl,
  filterForExistingContributors,
  associateContributorWithProfileData,
  getGenderFromGsheetData,
  findDuplicates
}
