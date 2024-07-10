import type { PgDb } from 'pogi'

import moment from 'moment'
import debug from 'debug'
import { UserInterests } from '../types'
import { getConfig } from '../config'
debug.enable('mailchimp:lib:getInterestsForUser')

const {
  MAILCHIMP_INTEREST_PLEDGE,
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR,
  MAILCHIMP_INTEREST_GRANTED_ACCESS,
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
} = getConfig()

export type GetInterestsForUserParams = {
  userId: string
  subscribeToEditorialNewsletters?: boolean
  pgdb: PgDb
}

export async function getInterestsForUser({
  userId,
  subscribeToEditorialNewsletters,
  pgdb,
}: GetInterestsForUserParams): Promise<UserInterests> {
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
  const accessGrants = !!user && (await findGrants(user, pgdb))
  const hasGrantedAccess = !!user && !!accessGrants && accessGrants.length > 0

  debug(
    JSON.stringify({
      userId,
      hasPledge,
      hasMembership,
      isBenefactor,
      hasGrantedAccess,
    }),
  )

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

async function findGrants(user, pgdb) {
  const now = moment()
  const query = {
    or: [
      { recipientUserId: user.id },
      { recipientUserId: null, email: user.email },
    ],
    'beginAt <=': now,
    'endAt >': now,
    invalidatedAt: null,
  }

  const grants = await pgdb.public.accessGrants.find(query, {
    orderBy: { createdAt: 'desc' },
  })

  return grants
}
