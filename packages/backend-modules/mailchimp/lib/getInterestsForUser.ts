import type { PgDb } from 'pogi'

const { grants } = require('@orbiting/backend-modules-access')

import debug from 'debug'
debug.enable('mailchimp:lib:getInterestsForUser')

const {
  MAILCHIMP_INTEREST_PLEDGE,
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR,
  MAILCHIMP_INTEREST_GRANTED_ACCESS,
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
} = process.env

export type GetInterestsForUserParams = {
  userId: string,
  subscribeToEditorialNewsletters?: boolean,
  pgdb: PgDb,
}

export function assertEnvVariableExists(envVariable: string | undefined): asserts envVariable is string {
  if (!envVariable) {
    throw new Error('Not all necessary Mailchimp Interest IDs are declared as env-Variables')
  }
}

export async function getInterestsForUser({
  userId,
  subscribeToEditorialNewsletters,
  pgdb
}: GetInterestsForUserParams) {
  assertEnvVariableExists(MAILCHIMP_INTEREST_PLEDGE)
  assertEnvVariableExists(MAILCHIMP_INTEREST_MEMBER)
  assertEnvVariableExists(MAILCHIMP_INTEREST_MEMBER_BENEFACTOR)
  assertEnvVariableExists(MAILCHIMP_INTEREST_GRANTED_ACCESS)
  assertEnvVariableExists(MAILCHIMP_INTEREST_NEWSLETTER_DAILY)
  assertEnvVariableExists(MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY)
  assertEnvVariableExists(MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR)

  const pledges =
    !!userId &&
    (await pgdb.public.pledges.find({
      userId,
      status: 'SUCCESSFUL',
    }))
  const hasPledge = !!pledges && pledges.length > 0

  const hasMembership =
    !!userId &&
    !!(await pgdb.public.memberships.findFirst({
      userId,
      active: true,
    }))

  const membershipTypeBenefactor = await pgdb.public.membershipTypes.findOne({
    name: 'BENEFACTOR_ABO',
  })
  const isBenefactor =
    !!userId && membershipTypeBenefactor
      ? !!(await pgdb.public.memberships.findFirst({
          userId,
          membershipTypeId: membershipTypeBenefactor.id,
        }))
      : false

  const user = !!userId && (await pgdb.public.users.findOne({ id: userId }))
  const accessGrants = !!user && (await grants.findByRecipient(user, { pgdb }))
  const hasGrantedAccess = !!user && !!accessGrants && accessGrants.length > 0

  debug(JSON.stringify({
    userId,
    hasPledge,
    hasMembership,
    isBenefactor,
    hasGrantedAccess,
  }))

  // Update the membership type interests on mailchimp
  const interests = {
    [MAILCHIMP_INTEREST_PLEDGE]: hasPledge,
    [MAILCHIMP_INTEREST_MEMBER]: hasMembership,
    [MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: isBenefactor,
    [MAILCHIMP_INTEREST_GRANTED_ACCESS]: hasGrantedAccess,
  }

  if (subscribeToEditorialNewsletters && (hasMembership || hasGrantedAccess)) {
    // Autosubscribe all newsletters when new user just paid the membersh.
    interests[MAILCHIMP_INTEREST_NEWSLETTER_DAILY] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] = true
  }

  return interests
}
