import type { PgDb } from 'pogi'
import moment from 'moment'
import { UserRow } from '@orbiting/backend-modules-types'
import MailchimpInterface from '../MailchimpInterface'
import { SegmentData, Membership } from '../types'

type GetSegmentDataForUserParams = {
  user: UserRow
  pgdb: PgDb
}

export async function getSegmentDataForUser({
  user,
  pgdb,
}: GetSegmentDataForUserParams): Promise<SegmentData> {
  const pledges =
    !!user.id &&
    (await pgdb.public.pledges.find({
      userId: user.id,
      status: 'SUCCESSFUL',
    }))

  const activeMembership: Membership = await pgdb.public.memberships.findFirst({
    userId: user.id,
    active: true,
  })
  
  const membershipType = activeMembership && await pgdb.public.membershipTypes.findFirst({
    id: activeMembership.membershipTypeId,
  })
  if (membershipType) {
    activeMembership.membershipTypeName = membershipType.name
  }
  
  const now = moment()
  const activeMembershipPeriod = activeMembership && await pgdb.public.membershipPeriods.findFirst({
    membershipId: activeMembership.id,
    'beginDate <=': now,
    'endDate >': now,
  })

  const membershipTypeBenefactor = await pgdb.public.membershipTypes.findOne({
    name: 'BENEFACTOR_ABO',
  })
  const benefactorMembership = await pgdb.public.memberships.findFirst({
    userId: user.id,
    membershipTypeId: membershipTypeBenefactor.id,
  })

  const accessGrants = !!user && (await findGrants(user, pgdb))

  const newsletterInterests = await getNewsletterInterests(user.email)

  return {
    pledges,
    activeMembership,
    activeMembershipPeriod,
    benefactorMembership,
    accessGrants,
    newsletterInterests,
  }
}

async function getNewsletterInterests(email) {
  const mailchimp = MailchimpInterface({ console })
  const member = await mailchimp.getMember(email)
  return member?.interests
}

async function findGrants(user: UserRow, pgdb: PgDb) {
  const query = {
    or: [
      { recipientUserId: user.id },
      { recipientUserId: null, email: user.email },
    ],
  }

  const grants = await pgdb.public.accessGrants.find(query, {
    orderBy: { createdAt: 'desc' },
  })

  return grants
}
