import type { PgDb } from 'pogi'
import moment from 'moment'
import { UserRow } from '@orbiting/backend-modules-types'
import { SegmentData, Membership, MailchimpContact } from '../types'

type GetSegmentDataForUserParams = {
  user: UserRow
  pgdb: PgDb
  mailchimpMember: MailchimpContact | undefined | null
}

export async function getSegmentDataForUser({
  user,
  pgdb,
  mailchimpMember,
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

  const activeMembershipCancellation =
    activeMembership &&
    (await pgdb.public.membershipCancellations.findFirst({
      membershipId: activeMembership.id,
      revokedAt: null,
    }, {orderBy: {createdAt: 'desc'}}))
  if (activeMembershipCancellation) {
    activeMembership.cancellationReason = activeMembershipCancellation?.reason
  }

  const membershipType =
    activeMembership &&
    (await pgdb.public.membershipTypes.findFirst({
      id: activeMembership.membershipTypeId,
    }))
  if (membershipType) {
    activeMembership.membershipTypeName = membershipType.name
  }

  const now = moment()
  const activeMembershipPeriod =
    activeMembership &&
    (await pgdb.public.membershipPeriods.findFirst({
      membershipId: activeMembership.id,
      'beginDate <=': now,
      'endDate >': now,
    }))

  const membershipTypeBenefactor = await pgdb.public.membershipTypes.findOne({
    name: 'BENEFACTOR_ABO',
  })
  const benefactorMembership = await pgdb.public.memberships.findFirst({
    userId: user.id,
    membershipTypeId: membershipTypeBenefactor.id,
  })

  const accessGrants = !!user && (await findGrants(user, pgdb))

  return {
    pledges,
    activeMembership,
    activeMembershipPeriod,
    benefactorMembership,
    accessGrants,
    mailchimpMember,
  }
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
