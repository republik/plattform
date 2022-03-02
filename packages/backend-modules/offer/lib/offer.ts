import * as Bluebird from 'bluebird'

import { GraphqlContext } from '@orbiting/backend-modules-types'
import { UserTransformed } from '@orbiting/backend-modules-auth/lib/transformUser'
import { timeFormat } from '@orbiting/backend-modules-formats'

const dateFormat = timeFormat('%x')

// Replace globale Promise w/ Bluebird
declare global {
  export interface Promise<T> extends Bluebird<T> {}
}

// @TODO: Expose properly in package
const { getPackages } = require('../../republik-crowdfundings/lib/User')
const {
  resolveMemberships,
} = require('../../republik-crowdfundings/lib/CustomPackages')

interface OfferStatus {
  id: string
  label: string
  description: string
}

interface Package {
  id: string
}

interface Offer {
  id: string
  status: OfferStatus | null
  packages: Package[]
}

// @TODO, weg von hier.
interface PledgeRow {
  id: string
}

interface MembershipRow {
  active: boolean
}

interface MembershipTypeRow {
  id: string
  name: string
}

interface PackageOption {
  membershipType?: MembershipTypeRow
}

interface PaymentRow {
  status: string
}

interface Pledge {
  payments: PaymentRow[]
}

interface PledgeOption {
  packageOption: PackageOption
}
interface MembershipPeriod {
  beginDate: Date
  endDate: Date
  pledge: Pledge
  pledgeOption?: PledgeOption
}

interface Membership {
  id: string
  active: boolean
  renew: boolean
  userId: string
  periods: MembershipPeriod[]
  latestPeriod: MembershipPeriod
  membershipType: MembershipTypeRow
}

interface AccessGrant {
  endAt: Date
}

const getFirstDay = (
  memberships: Membership[],
  user: UserTransformed,
): string | false => {
  if (!memberships.length) {
    return false
  }

  const firstDayDate = memberships
    .filter((m) => m.userId === user.id)
    .map((m) => m.periods.map((p) => p.beginDate).flat())
    .flat()
    .reduce((prev, curr) => (curr < prev ? curr : prev), new Date())

  return dateFormat(firstDayDate)
}

const findActiveMembership = (
  memberships: Membership[],
  user: UserTransformed,
): Membership | false => {
  return (
    memberships.find((m) => m.active === true && m.userId === user.id) || false
  )
}

const findLastActiveMembership = (
  memberships: Membership[],
  user: UserTransformed,
): Membership | false => {
  if (!memberships.length) {
    return false
  }

  const userMemberships = memberships.filter((m) => m.userId === user.id)
  if (!userMemberships.length) {
    return false
  }

  return userMemberships.reduce((prev, curr) =>
    curr.latestPeriod.endDate > prev.latestPeriod.endDate ? curr : prev,
  )
}

const getMembershipStatus = (
  context: GraphqlContext,
  membership: Membership,
  firstDay: string | false,
): Omit<OfferStatus, 'id'> => {
  const { t } = context

  const { latestPeriod, active, renew } = membership

  const endDate = dateFormat(latestPeriod.endDate)

  const membershipTypeName =
    latestPeriod.pledgeOption?.packageOption?.membershipType?.name ||
    membership.membershipType.name

  /* const hasWaitingPayments =
    memberships.length &&
    memberships
      .map((m) => m.periods.map((p) => p.pledge?.payments).flat())
      .flat()
      .filter(p => p.status === 'WAITING') */

  const replacements = {
    firstDay,
    endDate,
    membershipTypeName,
    active,
    renew,
  }

  return {
    label: t(
      'api/offer/status/label',
      {
        type: t.first(
          [
            `api/offer/status/label/type/${membershipTypeName}`,
            'api/offer/status/label/type',
          ],
          replacements,
        ),
        since: t.first(
          [
            `api/offer/status/label/since/${membershipTypeName}`,
            'api/offer/status/label/since',
          ],
          replacements,
        ),
      },
      `membershipTypeName: ${membershipTypeName}, firstDay: ${firstDay}`,
    ),
    description: t(
      'api/offer/status/description',
      {
        due: t.first(
          [
            `api/offer/status/description/due/active:${active}/renew:${renew}/${membershipTypeName}`,
            `api/offer/status/description/due/active:${active}/renew:${renew}`,
          ],
          { ...replacements,
            type: t.first(
              [
                `api/offer/status/description/type/${membershipTypeName}`,
                'api/offer/status/description/type',
              ],
              replacements,
            )
          },
        ),
      },
      `active: ${active}, renew: ${renew}, endDate: ${endDate}`,
    ),
  }
}

const getAccessGrantStatus = (
  context: GraphqlContext,
  accessGrant: AccessGrant,
): Omit<OfferStatus, 'id'> => {
  const { t } = context

  const lastDay = dateFormat(accessGrant.endAt)
  const isExpired = accessGrant.endAt < new Date()

  const replacements = {
    lastDay,
    isExpired,
  }

  return {
    label: t('offer/status/label', replacements, `lastDay: ${lastDay}`),
    description: t(
      'offer/status/description',
      replacements,
      `isExpired: ${isExpired}`,
    ),
  }
}

export const getStatus = async function (
  context: GraphqlContext,
  overrideUser?: UserTransformed,
): Promise<OfferStatus | null> {
  const { user: contextUser, pgdb } = context
  const user = overrideUser || contextUser
  if (!user) {
    return null
  }

  const pledges: PledgeRow[] = await pgdb.public.pledges.find({
    userId: user?.id,
    status: 'SUCCESSFUL', // @TODO: Broaden?
  })

  // @TODO: Payments? für overdue et al.
  const memberships_: MembershipRow[] = await pgdb.public.memberships.find({
    or: [
      { userId: user.id },
      pledges?.length > 0 && {
        pledgeId: pledges.map((pledge) => pledge.id),
      },
    ].filter(Boolean),
  })

  const memberships: Membership[] = await resolveMemberships({
    memberships: memberships_,
    pgdb,
  })

  // A users very first day
  const firstDay = getFirstDay(memberships, user)

  const membership =
    findActiveMembership(memberships, user) ||
    findLastActiveMembership(memberships, user)
  if (membership) {
    return {
      ...getMembershipStatus(context, membership, firstDay),
      id: 'active-membership', // @TODO: Make this nice, please.
    }
  }

  const accessGrant = await pgdb.public.accessGrants.findOne(
    { recipientUserId: user.id },
    { orderBy: { endAt: 'desc' }, limit: 1 },
  )
  if (accessGrant) {
    return {
      ...getAccessGrantStatus(context, accessGrant),
      id: 'access-grant', // œTODO: Make this nicesst, please.
    }
  }

  return null
}

export const getOffer = async function (
  context: GraphqlContext,
  overrideUser?: UserTransformed,
): Promise<Offer> {
  const { user: contextUser, pgdb } = context
  const user = overrideUser || contextUser

  const [status, packages] = await Promise.all([
    getStatus(context, overrideUser),
    getPackages({
      pledger: user,
      pgdb,
    }),
  ])

  return {
    id: Buffer.from(['offer', 'userId', user?.id].join('')).toString('base64'),
    status,
    packages,
  }
}
