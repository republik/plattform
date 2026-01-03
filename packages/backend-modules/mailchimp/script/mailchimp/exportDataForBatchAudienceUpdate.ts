#!/usr/bin/env node
import env from '@orbiting/backend-modules-env'
import type { Readable } from 'stream'
env.config()
import yargs from 'yargs'
import csvParser from 'csv-parser'
import { PgDb } from '@orbiting/backend-modules-base/lib'
import { UserRow } from '@orbiting/backend-modules-types'
import bluebird from 'bluebird'
import {
  getInterestsForUser,
  getMergeFieldsForUser,
  getSegmentDataForUser,
} from '../../lib'
import { MailchimpContact } from '../../types'
import { getConfig } from '../../config'
import MailchimpInterface from '../../MailchimpInterface'

const {
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
  MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE,
  MAILCHIMP_INTEREST_NEWSLETTER_WDWWW,
  MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY,
  MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE,
} = getConfig()

type CsvImport = {
  email: string
  newsletters: string[]
}
type Audience = 'newsletter' | 'produktinfos' | 'marketing'
type MailchimpData = { user: UserRow; newsletterData: string[] }

async function main(argv: any) {
  const audience: Audience = argv['audience']

  if (
    audience !== 'newsletter' &&
    audience !== 'produktinfos' &&
    audience !== 'marketing'
  ) {
    throw new Error(
      'Audience %s not valid, has to be newsletter, produktinfos or marketing',
    )
  }

  const pgdb = await PgDb.connect({
    applicationName: 'Export script for mailchimp audience batch update',
  })

  console.log(
    [
      'id',
      'EMAIL',
      'FNAME',
      'LNAME',
      'PL_AMOUNT',
      'END_DATE',
      'SUB_TYPE',
      'SUB_STATE',
      'TRIAL',
      'NL_LINK_CA',
      'NL_LINK_WD',
      'NL_DAILY',
      'NL_WEEKLY',
      'NL_PROJ_R',
      'NL_CLIMATE',
      'NL_WDWWW',
      'NL_SUNDAY',
      'NL_ACCOMPL',
    ].join(','),
  )

  const rawMailchimpData: CsvImport[] = await parse(process.stdin)

  const emails: string[] = rawMailchimpData.map((csvImport) => csvImport.email)
  const newsletterData: string[][] = rawMailchimpData.map(
    (csvImport) => csvImport.newsletters,
  )
  const emailIndex: Map<string, number> = new Map()
  for (let i = 0; i < emails.length; i++) {
    emailIndex.set(emails[i], i)
  }

  const users: UserRow[] = await pgdb.public.users.find({ email: emails })

  const mailchimpData: MailchimpData[] = []
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const nlIndex = emailIndex.get(user.email)
    if (nlIndex) {
      const data: MailchimpData = {
        user,
        newsletterData: newsletterData[nlIndex],
      }
      mailchimpData.push(data)
    }
  }

  // go through all users and get segment data
  await bluebird.map(mailchimpData, async (mailchimpData) => {
    const { user, newsletterData } = mailchimpData
    const mailchimpMember = await getMailchimpMember(user.email, newsletterData)
    const segmentData = await getSegmentDataForUser({
      user,
      pgdb,
      mailchimpMember,
    })
    const interests = await getInterestsForUser({ user, segmentData })
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })

    const record: Record<string, any> = {
      id: user.id,
      EMAIL: user.email,
      FNAME: `"${user.firstName ?? ''}"`,
      LNAME: `"${user.lastName ?? ''}"`,
      PL_AMOUNT: mergeFields.PL_AMOUNT,
      END_DATE: mergeFields.END_DATE ? new Date(mergeFields.END_DATE).toISOString() : undefined,
      SUB_TYPE: mergeFields.SUB_TYPE,
      SUB_STATE: mergeFields.SUB_STATE,
      TRIAL: mergeFields.TRIAL,
      NL_LINK_CA: mergeFields.NL_LINK_CA,
      NL_LINK_WD: mergeFields.NL_LINK_WD,
      NL_DAILY: interests[MAILCHIMP_INTEREST_NEWSLETTER_DAILY]
        ? 'Subscribed'
        : 'Unsubscribed',
      NL_WEEKLY: interests[MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]
        ? 'Subscribed'
        : 'Unsubscribed',
      NL_PROJ_R: interests[MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]
        ? 'Subscribed'
        : 'Unsubscribed',
      NL_CLIMATE: interests[MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE]
        ? 'Subscribed'
        : 'Unsubscribed',
      NL_WDWWW: interests[MAILCHIMP_INTEREST_NEWSLETTER_WDWWW]
        ? 'Subscribed'
        : 'Unsubscribed',
      NL_SUNDAY: interests[MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY]
        ? 'Subscribed'
        : 'Unsubscribed',
      NL_ACCOMPL: interests[MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE]
        ? 'Subscribed'
        : 'Unsubscribed',
    }

    if (audience === 'newsletter') {
      // update all downloaded contacts with segments, archive Unsubscribed and not subscribed to NL manually on mailchimp
      console.log(
        Object.keys(record)
          .map((key) => record[key])
          .join(','),
      )
    } else if (audience === 'produktinfos') {
      // update and upload only people with active subscription
      if (segmentData?.activeMembership) {
        console.log(
          Object.keys(record)
            .map((key) => record[key])
            .join(','),
        )
      }
    } else if (audience === 'marketing') {
      // update and upload only people without active subscription, archive people with subscription on mailchimp manually
      if (!segmentData?.activeMembership) {
        console.log(
          Object.keys(record)
            .map((key) => record[key])
            .join(','),
        )
      }
    }
  })

  await PgDb.disconnect(pgdb)
}

async function getMailchimpMember(
  email: string,
  data: string[],
): Promise<MailchimpContact | undefined> {
  const mailchimpMember: MailchimpContact = {
    id: '',
    email_address: email,
    status: MailchimpInterface.MemberStatus.Subscribed,
    merge_fields: {},
    interests: {},
  }
  const interests = {
    [MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: false,
    [MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: false,
    [MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: false,
    [MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE]: false,
    [MAILCHIMP_INTEREST_NEWSLETTER_WDWWW]: false,
    [MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE]: false,
    [MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY]: false,
  }

  if (data.includes('Täglich')) {
    interests[MAILCHIMP_INTEREST_NEWSLETTER_DAILY] = true
  }

  if (data.includes('Wochenende')) {
    interests[MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY] = true
  }

  if (data.includes('Project R')) {
    interests[MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] = true
  }

  if (data.includes('CLIMATE')) {
    interests[MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE] = true
  }

  if (data.includes('WDWWW')) {
    interests[MAILCHIMP_INTEREST_NEWSLETTER_WDWWW] = true
  }

  if (data.includes('ACCOMPLICE')) {
    interests[MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE] = true
  }

  if (data.includes('SUNDAY')) {
    interests[MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY] = true
  }

  mailchimpMember.interests = interests
  return mailchimpMember
}

/**
 * Parse and process csv input from readable stream
 * @param {import('stream').Readable} readStream
 * @returns
 */
async function parse(readStream: Readable) {
  const results: CsvImport[] = []
  const stream = readStream.pipe(
    csvParser({
      mapHeaders: ({ header }) => header.toLowerCase(),
    }),
  )

  for await (const line of stream) {
    results.push({
      email: line['e-mail-adresse'],
      newsletters: line['republik nl'].split(', '),
    })
  }

  return results
}

const argv = yargs.option('audience', {
  default: 'newsletter',
}).argv

main(argv)
