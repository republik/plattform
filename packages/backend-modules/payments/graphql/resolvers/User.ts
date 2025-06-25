import { GraphqlContext, User } from '@orbiting/backend-modules-types'
import { Company, USER_VISIBLE_STATUS_TYPES } from '../../lib/types'
import { default as Auth } from '@orbiting/backend-modules-auth'
import { PgDb } from 'pogi'
import { CustomerInfoService } from '../../lib/services/CustomerInfoService'
import { SubscriptionService } from '../../lib/services/SubscriptionService'

export = {
  async stripeCustomer(
    user: User,
    { company }: { company: Company },
    ctx: GraphqlContext,
  ) {
    Auth.Roles.ensureUserIsMeOrInRoles(user, ctx.user, ['admin', 'supporter'])

    return await new CustomerInfoService(ctx.pgdb).getCustomerIdForCompany(
      user.id,
      company,
    )
  },

  async activeMagazineSubscription(
    user: User,
    _args: never,
    ctx: GraphqlContext,
  ) {
    Auth.Roles.ensureUserIsMeOrInRoles(user, ctx.user, ['admin', 'supporter'])

    try {
      const res = await new SubscriptionService(
        ctx.pgdb,
      ).fetchActiveSubscription(user.id)
      return res
    } catch (e) {
      console.log(e)
      return []
    }
  },

  async magazineSubscriptions(user: User, _args: never, ctx: GraphqlContext) {
    Auth.Roles.ensureUserIsMeOrInRoles(user, ctx.user, ['admin', 'supporter'])
    try {
      const res = await new SubscriptionService(ctx.pgdb).listSubscriptions(
        user.id,
        USER_VISIBLE_STATUS_TYPES,
      )
      return res
    } catch (e) {
      console.log(e)
      return []
    }
  },

  async transactions(user: User, _args: never, ctx: GraphqlContext) {
    Auth.Roles.ensureUserIsMeOrInRoles(user, ctx.user, ['admin', 'supporter'])

    try {
      return fetchTransactions(ctx.pgdb, user.id)
    } catch (e) {
      console.log(e)
      return []
    }
  },
}

function fetchTransactions(pgdb: PgDb, userId: string) {
  return pgdb.payments.query(
    `
    SELECT
      id,
      "subscriptionId",
      NULL as "pledgeId",
      company::text,
      status::text,
      total as amount,
      "createdAt"
    FROM payments.invoices WHERE "userId" = :userId
    UNION ALL
    SELECT
      "pledgePayments".id,
      NULL AS "subscriptionId",
      "pledgePayments"."pledgeId",
      companies.name as company,
      p_payments.status::text as status,
      p_payments.total as amount,
      "pledgePayments"."createdAt"
    FROM
    public."pledgePayments" AS "pledgePayments"
  	JOIN public.pledges AS pledges ON "pledgePayments"."pledgeId" = pledges.id
  	JOIN public.payments AS p_payments ON "pledgePayments"."paymentId" = p_payments.id
  	JOIN public.packages AS package ON pledges."packageId" = package.id
  	JOIN public.companies AS companies ON package."companyId" = companies.id
    WHERE pledges."userId" = :userId ORDER BY "createdAt" DESC
  `,
    {
      userId: userId,
    },
  )
}
