import { UserRow } from '@orbiting/backend-modules-types'
import { MergeFieldName, SegmentData } from '../types'

type GetMergeFieldsForUserParams = { user: UserRow; segmentData: SegmentData }
type UserMergeFields = Partial<Record<MergeFieldName, string | number | Date>>

export const mergeFieldNames = {
  firstName: 'FNAME',
  lastName: 'LNAME',
  latestPledgeAmount: 'PL_AMOUNT',
  subscriptionEndDate: 'END_DATE',
  subscriptionType: 'SUB_TYPE',
} as const

export async function getMergeFieldsForUser({
  user,
  segmentData,
}: GetMergeFieldsForUserParams): Promise<UserMergeFields> {
  const latestMembershipPledgeId = segmentData.activeMembershipPeriod?.pledgeId
  const filteredPledges = segmentData.pledges?.filter(
    (pledge) => pledge.id === latestMembershipPledgeId,
  )
  const latestMembershipPledgeAmount =
    filteredPledges?.length === 1 ? filteredPledges[0].total / 100 : 0

  return {
    [mergeFieldNames.firstName]: user.firstName,
    [mergeFieldNames.lastName]: user.lastName,
    [mergeFieldNames.latestPledgeAmount]: latestMembershipPledgeAmount,
    [mergeFieldNames.subscriptionEndDate]: segmentData.activeMembershipPeriod?.endDate,
    [mergeFieldNames.subscriptionType]: segmentData.activeMembership?.membershipTypeName,
  }
}
