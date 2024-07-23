#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

import yargs from 'yargs'
import csvParser from 'csv-parser'
import { ConnectionContext } from '@orbiting/backend-modules-base'
import { UserRow } from '@orbiting/backend-modules-types'
import bluebird from 'bluebird'
import { getInterestsForUser, getMergeFieldsForUser, getSegmentDataForUser } from '../../lib'
import { UserInterests } from '../../types'
import { getConfig } from '../../config'

const { 
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY, 
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
  MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE,
  MAILCHIMP_INTEREST_NEWSLETTER_WDWWW,
  MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE
} = getConfig()

type CsvImport = {
  email: string
  newsletters: string[]
}
type Audience = 'newsletter' | 'produktinfos' | 'marketing'
type MailchimpData = { user: UserRow, newsletterData: string[] }

const argv = yargs.option('audience', {
  default: 'newsletter',
}).argv

const audience: Audience = argv['audience']

if (audience !== 'newsletter' && audience !== 'produktinfos' && audience !== 'marketing') {
  throw new Error('Audience %s not valid, has to be newsletter, produktinfos or marketing')
}

// do stuff
ConnectionContext.create('Export script for mailchimp audience batch update')
  .then(async (context) => {
    const { pgdb } = context

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
        'NL_LINK_WD'
      ].join(','),
    )

    // get users from mailchimp audience (csv?)
    const rawMailchimpData = await parse(process.stdin) 

    // one DB call to find all user rows
    const emails: string[] = rawMailchimpData.map((csvImport) => csvImport.email)
    const users: UserRow[] = await pgdb.public.users.find({email: emails})
    const newsletterData: string[][] = rawMailchimpData.map((csvImport) => csvImport.newsletters)

    const mailchimpData: MailchimpData[] = []
    for (let i = 0; i < users.length; i++) {
      const data: MailchimpData = {user: users[i], newsletterData: newsletterData[i]}
      mailchimpData.push(data)
    }

    // go through all users and get segment data
    bluebird.map(mailchimpData, async (mailchimpData) => {
      const {user, newsletterData } = mailchimpData
      const newsletterInterests = await getNewsletterInterests(newsletterData)
      const segmentData = await getSegmentDataForUser({user, pgdb, newsletterInterests})
      const interests = await getInterestsForUser({ user, segmentData })
      const mergeFields = await getMergeFieldsForUser({ user, segmentData })

      const record = {
        id: user.id,
        EMAIL: user.email,
        FNAME: `"${user.firstName ?? ''}"`,
        LNAME: `"${user.lastName ?? ''}"`,
        PL_AMOUNT: mergeFields.PL_AMOUNT,
        END_DATE: mergeFields.END_DATE,
        SUB_TYPE: mergeFields.SUB_TYPE,
        SUB_STATE: mergeFields.SUB_STATE,
        TRIAL: mergeFields.TRIAL,
        NL_LINK_CA: mergeFields.NL_LINK_CA,
        NL_LINK_WD: mergeFields.NL_LINK_WD,
        [MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: interests[MAILCHIMP_INTEREST_NEWSLETTER_DAILY] ? 'Subscribed' : 'Unsubscribed',
        [MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: interests[MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY] ? 'Subscribed' : 'Unsubscribed',
        [MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: interests[MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] ? 'Subscribed' : 'Unsubscribed',
        [MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE]: interests[MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE] ? 'Subscribed' : 'Unsubscribed',
        [MAILCHIMP_INTEREST_NEWSLETTER_WDWWW]: interests[MAILCHIMP_INTEREST_NEWSLETTER_WDWWW] ? 'Subscribed' : 'Unsubscribed',
        [MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE]: interests[MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE] ? 'Subscribed' : 'Unsubscribed',
      }

      if (audience === 'newsletter') {
        // update all downloaded contacts with segments, archive Unsubscribed and not subscribed to NL manually on mailchimp
        console.log(record)
      } else if (audience === 'produktinfos') {
        // update and upload only people with active subscription
        if (segmentData?.activeMembership) {
          console.log(record)
        }
      } else if (audience === 'marketing') {
        // update and upload only people without active subscription, archive people with subscription on mailchimp manually
        if (!segmentData?.activeMembership) {
          console.log(record)
        }
      }
    })

    return context
  })
  .then((context) => ConnectionContext.close(context))
  .catch((error) => console.error('Error: %s', error))

  async function getNewsletterInterests(data: string[]): Promise<UserInterests | undefined> {
    const interests = {
      [MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: false, 
      [MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: false,
      [MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: false,
      [MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE]: false,
      [MAILCHIMP_INTEREST_NEWSLETTER_WDWWW]: false,
      [MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE]: false,
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
    return interests
  }

  /**
 * Parse and process csv input from readable stream
 * @param {import('stream').Readable} readStream
 * @returns
 */
async function parse(readStream) {
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
