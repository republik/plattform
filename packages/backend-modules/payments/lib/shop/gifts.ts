/* eslint-disable @typescript-eslint/no-unused-vars */
import { PgDb } from 'pogi'
import { Company } from '../types'
import Stripe from 'stripe'
import { CrockfordBase32 } from 'crockford-base32'
import { ProjectRStripe, RepublikAGStripe } from '../providers/stripe'
import { CustomerRepo } from '../database/CutomerRepo'
import { activeOffers } from './offers'
import dayjs from 'dayjs'
import { GiftVoucherRepo } from '../database/GiftVoucherRepo'
import createLogger from 'debug'
import { getConfig } from '../config'
import { parseStripeDate } from '../handlers/stripe/utils'
import { CustomerInfoService } from '../services/CustomerInfoService'
import { Logger } from '@orbiting/backend-modules-types'
import { OfferService } from '../services/OfferService'
import { Item, PaymentService } from '../services/PaymentService'

const logger = createLogger('payments:gifts')

export class GiftNotApplicableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'api/gifts/error/gift_not_applicable'
  }
}

export class GiftAlreadyAppliedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'api/gifts/error/gift_already_applied'
  }
}

export type ApplyGiftResult = {
  id?: string
  aboType: string
  company: Company
  starting: Date
}

export type Gift = {
  id: string
  company: Company
  offer: string
  coupon: string
  valueType: 'FIXED' | 'PERCENTAGE'
  value: number
  duration: number
  durationUnit: 'year' | 'month'
}

export type Voucher = {
  id?: string
  orderId: string | null
  code: string
  giftId: string
  issuedBy: Company
  redeemedBy: string | null
  redeemedForCompany: Company | null
  redeemedAt: Date | null
}

type PLEDGE_ABOS = 'ABO' | 'MONTHLY_ABO' | 'YEARLY_ABO' | 'BENEFACTOR_ABO'
type SUBSCRIPTIONS = 'YEARLY_SUBSCRIPTION' | 'MONTHLY_SUBSCRIPTION'
type PRODUCT_TYPE = PLEDGE_ABOS | SUBSCRIPTIONS

export function normalizeVoucher(voucherCode: string): string | null {
  try {
    return CrockfordBase32.encode(CrockfordBase32.decode(voucherCode))
  } catch {
    return null
  }
}

function newVoucherCode() {
  return CrockfordBase32.encode(
    Buffer.from(crypto.getRandomValues(new Uint8Array(5))),
  )
}

const GIFTS: Gift[] = [
  {
    id: 'GIFT_YEARLY',
    duration: 1,
    durationUnit: 'year',
    offer: 'YEARLY',
    coupon: getConfig().PROJECT_R_YEARLY_GIFT_COUPON,
    company: 'PROJECT_R',
    value: 100,
    valueType: 'PERCENTAGE',
  },
  {
    id: 'GIFT_MONTHLY',
    duration: 3,
    durationUnit: 'month',
    offer: 'MONTHLY',
    coupon: getConfig().REPUBLIK_3_MONTH_GIFT_COUPON,
    company: 'REPUBLIK',
    value: 100,
    valueType: 'PERCENTAGE',
  },
]

export const REPUBLIK_PAYMENTS_SUBSCRIPTION_REPLACES =
  'republik.subscription.replaces'

export const REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN =
  'republik.subscription.origin'

export const REPUBLIK_PAYMENTS_CANCEL_REASON = 'republik.system.cancel-reason'

export class GiftShop {
  #pgdb: PgDb
  #giftRepo: GiftVoucherRepo
  #stripeAdapters: Record<Company, Stripe> = {
    PROJECT_R: ProjectRStripe,
    REPUBLIK: RepublikAGStripe,
  }
  #customerInfoService: CustomerInfoService
  #offerService: OfferService
  #paymentService: PaymentService

  constructor(pgdb: PgDb, _logger: Logger) {
    this.#pgdb = pgdb
    this.#giftRepo = new GiftVoucherRepo(pgdb)
    this.#customerInfoService = new CustomerInfoService(this.#pgdb)
    this.#offerService = new OfferService(activeOffers())
    this.#paymentService = new PaymentService()
  }

  async generateNewVoucher({
    company,
    orderId,
    giftId,
  }: {
    company: Company
    orderId?: string
    giftId: string
  }) {
    const voucher: Voucher = {
      orderId: orderId || null,
      issuedBy: company,
      code: newVoucherCode(),
      giftId: giftId,
      redeemedAt: null,
      redeemedBy: null,
      redeemedForCompany: null,
    }

    this.#giftRepo.saveVoucher(voucher)

    return voucher
  }

  async redeemVoucher(
    voucherCode: string,
    userId: string,
  ): Promise<ApplyGiftResult> {
    const code = normalizeVoucher(voucherCode)
    if (!code) {
      throw new Error('voucher is invalid')
    }

    const voucher = await this.#giftRepo.getVoucherByCode(code)
    if (!voucher) {
      throw new Error('Unknown voucher')
    }

    if (voucher.redeemedAt !== null) {
      throw new Error('gift has already been redeemed')
    }

    const gift = await this.getGift(voucher.giftId)
    if (!gift) {
      throw new Error('unknown gift unsuspected system error')
    }

    const current = await this.getCurrentUserAbo(userId)

    try {
      const abo = await this.applyGift(userId, current, gift)

      await this.markVoucherAsRedeemed({
        voucher,
        userId,
        company: abo.company,
      })

      return abo
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  private async applyGift(
    userId: string,
    current: { type: string; id: string } | null,
    gift: Gift,
  ): Promise<ApplyGiftResult> {
    if (!current) {
      // create new subscription with the gift if the user has no active subscription
      return this.applyGiftToNewSubscription(userId, gift)
    }

    switch (current.type) {
      case 'ABO':
        return this.applyGiftToMembershipAbo(userId, current.id, gift)
      case 'MONTHLY_ABO':
        return this.applyGiftToMonthlyAbo(userId, current.id, gift)
      case 'YEARLY_ABO':
        return this.applyGiftToYearlyAbo(userId, current.id, gift)
      case 'BENEFACTOR_ABO':
        return this.applyGiftToBenefactor(userId, current.id, gift)
      case 'YEARLY_SUBSCRIPTION':
        return this.applyGiftToYearlySubscription(userId, current.id, gift)
      case 'MONTHLY_SUBSCRIPTION':
        return this.applyGiftToMonthlySubscription(userId, current.id, gift)
      default:
        throw new GiftNotApplicableError(
          `unsuppored abo type combination ${current.type}`,
        )
    }
  }

  private async getGift(id: string) {
    return GIFTS.find((gift) => gift.id === id) || null
  }

  private async markVoucherAsRedeemed(args: {
    voucher: Voucher
    userId: string
    company: Company
  }) {
    this.#giftRepo.updateVoucher(args.voucher.id!, {
      redeemedAt: new Date(),
      redeemedBy: args.userId,
      redeemedForCompany: args.company,
    })
  }

  private async getCurrentUserAbo(
    userId: string,
  ): Promise<{ type: PRODUCT_TYPE; id: string } | null> {
    const result = await this.#pgdb.query(
      `SELECT
        "id",
        "type"::text as "type"
      FROM payments.subscriptions
      WHERE
        "userId" = :userId
        AND status in ('active')
      UNION
      SELECT
        m.id,
        mt."name"::text as "type"
      FROM memberships m
        JOIN "membershipTypes" mt
        ON m."membershipTypeId" = mt.id
      WHERE m."userId" = :userId
      AND m.active = true`,
      { userId },
    )

    if (!result.length) {
      return null
    }

    return result[0]
  }

  private async applyGiftToNewSubscription(
    userId: string,
    gift: Gift,
  ): Promise<ApplyGiftResult> {
    const cRepo = new CustomerRepo(this.#pgdb)

    const customerId = await this.getCustomerId(cRepo, gift.company, userId)
    const lineItems = await this.buildGiftItems({ offerId: gift.offer })

    const subscription = await this.#stripeAdapters[
      gift.company
    ].subscriptions.create({
      customer: customerId,
      items: lineItems,
      discounts: [{ coupon: gift.coupon }],
      collection_method: 'send_invoice',
      days_until_due: 14,
      metadata: {
        [REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN]: 'GIFT',
      },
    })

    if (subscription.latest_invoice) {
      await this.#stripeAdapters[gift.company].invoices.finalizeInvoice(
        subscription.latest_invoice.toString(),
      )
    }
    return { aboType: gift.offer, company: gift.company, starting: new Date() }
  }

  private async applyGiftToMembershipAbo(
    _userId: string,
    membershipId: string,
    gift: Gift,
  ): Promise<ApplyGiftResult> {
    const tx = await this.#pgdb.transactionBegin()
    try {
      const endDate = await this.getMembershipEndDate(tx, membershipId)

      const newMembershipPeriod =
        await tx.public.membershipPeriods.insertAndGet({
          membershipId: membershipId,
          beginDate: endDate.toDate(),
          endDate: endDate.add(gift.duration, gift.durationUnit).toDate(),
          kind: 'GIFT',
        })

      logger('new membership period created %s', newMembershipPeriod.id)

      await tx.transactionCommit()

      return {
        id: membershipId,
        aboType: 'ABO',
        company: 'PROJECT_R',
        starting: endDate.toDate(),
      }
    } catch (e) {
      await tx.transactionRollback()
      throw e
    }
  }

  private async applyGiftToMonthlyAbo(
    userId: string,
    membershipId: string,
    gift: Gift,
  ): Promise<ApplyGiftResult> {
    const stripeId = await this.getStripeIdForMonthlyAbo(membershipId)

    if (!stripeId) {
      throw new Error(`membership ${membershipId} does not exist`)
    }

    switch (gift.company) {
      case 'REPUBLIK': {
        const currentSub =
          await this.#stripeAdapters.REPUBLIK.subscriptions.retrieve(stripeId, {
            expand: ['discounts'],
          })

        if (currentSub === null) {
          throw new Error('Subscription retival error')
        }

        ensureCouponCanBeApplied(currentSub, gift)

        const sub = await this.#stripeAdapters.REPUBLIK.subscriptions.update(
          stripeId,
          {
            discounts: [{ coupon: gift.coupon }],
            cancel_at_period_end: false, // if a subscription is canceled we need to uncancel it.
          },
        )

        // TODO!: ensure that this is the period of the magazine subscription
        const current_period_end = sub.items.data[0].current_period_end

        return {
          id: membershipId,
          aboType: 'MONLTY_ABO',
          company: 'REPUBLIK',
          starting: parseStripeDate(current_period_end),
        }
      }
      case 'PROJECT_R': {
        const cRepo = new CustomerRepo(this.#pgdb)
        const customerId = await this.getCustomerId(cRepo, 'PROJECT_R', userId)

        this.#offerService.isValidOffer(gift.offer)

        const tx = await this.#pgdb.transactionBegin()

        const updatedMembership = await tx.public.memberships.updateAndGetOne(
          {
            id: membershipId,
          },
          {
            renew: false,
            updatedAt: new Date(),
          },
        )

        await tx.membershipCancellations.insert({
          membershipId: updatedMembership.id,
          reason: 'gift upgrade to yearly_subscription',
          category: 'SYSTEM',
          suppressConfirmation: true,
          suppressWinback: true,
          cancelledViaSupport: true,
        })

        await tx.transactionCommit()

        //cancel old monthly subscription on Republik AG stripe
        const oldSub = await this.cancelSubscriptionForUpgrade(
          this.#stripeAdapters.REPUBLIK,
          stripeId,
        )

        const lineItems = await this.buildGiftItems({ offerId: gift.offer })

        // TODO!: ensure that this is the period of the magazine subscription
        const current_period_end = oldSub.items.data[0].current_period_end

        // create new subscription starting at the end period of the old one
        await this.#stripeAdapters.PROJECT_R.subscriptionSchedules.create({
          customer: customerId,
          start_date: current_period_end,
          phases: [
            {
              items: lineItems,
              iterations: 1,
              collection_method: 'send_invoice',
              discounts: [{ coupon: gift.coupon }],
              invoice_settings: {
                days_until_due: 14,
              },
              metadata: {
                [REPUBLIK_PAYMENTS_SUBSCRIPTION_REPLACES]: `monthly_abo:${membershipId}`,
                [REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN]: 'GIFT',
              },
            },
          ],
        })

        return {
          id: membershipId,
          aboType: 'YEARLY_SUBSCRIPION',
          company: 'PROJECT_R',
          starting: parseStripeDate(current_period_end),
        }
      }
    }
  }
  private async applyGiftToYearlyAbo(
    userId: string,
    id: string,
    gift: Gift,
  ): Promise<ApplyGiftResult> {
    const cRepo = new CustomerRepo(this.#pgdb)
    const customerId = await this.getCustomerId(cRepo, gift.company, userId)
    const endDate = await this.getMembershipEndDate(this.#pgdb, id)

    const lineItems = await this.buildGiftItems({ offerId: gift.offer })

    await this.#stripeAdapters[gift.company].subscriptionSchedules.create({
      customer: customerId,
      start_date: endDate.unix(),
      phases: [
        {
          items: lineItems,
          iterations: 1,
          collection_method: 'send_invoice',
          discounts: [{ coupon: gift.coupon }],
          invoice_settings: {
            days_until_due: 14,
          },
          metadata: {
            [REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN]: 'GIFT',
          },
        },
      ],
    })

    return {
      aboType: gift.offer,
      company: gift.company,
      starting: endDate.toDate(),
    }
  }

  private async applyGiftToBenefactor(
    _userId: string,
    _id: string,
    _gift: Gift,
  ): Promise<ApplyGiftResult> {
    throw new Error('Not implemented')
  }

  private async applyGiftToYearlySubscription(
    _userId: string,
    id: string,
    gift: Gift,
  ): Promise<ApplyGiftResult> {
    const stripeId = await this.getStripeSubscriptionId(id)

    if (!stripeId) {
      throw new Error(`yearly subscription ${id} does not exist`)
    }

    switch (gift.company) {
      case 'PROJECT_R': {
        const sub = await this.#stripeAdapters.PROJECT_R.subscriptions.update(
          stripeId,
          {
            discounts: [{ coupon: gift.coupon }],
            cancel_at_period_end: false, // if a subscription is canceled we need to uncancel it.
          },
        )
        // TODO!: ensure that this is the period of the magazine subscription
        const current_period_end = sub.items.data[0].current_period_end
        return {
          id: id,
          aboType: 'YEARLY',
          company: 'PROJECT_R',
          starting: parseStripeDate(current_period_end),
        }
      }
      case 'REPUBLIK': {
        throw new GiftNotApplicableError(`${gift.id}:yearly_subscriptions`)
      }
    }
  }

  private async applyGiftToMonthlySubscription(
    userId: string,
    subScriptionId: string,
    gift: Gift,
  ): Promise<ApplyGiftResult> {
    const stripeId = await this.getStripeSubscriptionId(subScriptionId)

    if (!stripeId) {
      throw new Error(`monthly subscription ${subScriptionId} does not exist`)
    }

    switch (gift.company) {
      case 'REPUBLIK': {
        const currentSub =
          await this.#stripeAdapters.REPUBLIK.subscriptions.retrieve(stripeId, {
            expand: ['discounts'],
          })

        if (currentSub === null) {
          throw new Error('Subscription retival error')
        }

        ensureCouponCanBeApplied(currentSub, gift)

        const sub = await this.#stripeAdapters.REPUBLIK.subscriptions.update(
          stripeId,
          {
            discounts: [{ coupon: gift.coupon }],
            cancel_at_period_end: false, // if a subscription is canceled we need to uncancel it.
          },
        )

        // TODO!: ensure that this is the period of the magazine subscription
        const current_period_end = sub.items.data[0].current_period_end
        return {
          id: subScriptionId,
          aboType: 'MONLTY',
          company: 'REPUBLIK',
          starting: parseStripeDate(current_period_end),
        }
      }
      case 'PROJECT_R': {
        const cRepo = new CustomerRepo(this.#pgdb)

        const customerId = await this.getCustomerId(cRepo, 'PROJECT_R', userId)

        const lineItems = await this.buildGiftItems({ offerId: gift.offer })

        //cancel old monthly subscription on Republik AG
        const oldSub = await this.cancelSubscriptionForUpgrade(
          this.#stripeAdapters.REPUBLIK,
          stripeId,
        )

        // TODO!: ensure that this is the period of the magazine subscription
        const current_period_end = oldSub.items.data[0].current_period_end

        // create new subscription starting at the end period of the old one
        await this.#stripeAdapters.PROJECT_R.subscriptionSchedules.create({
          customer: customerId,
          start_date: current_period_end,
          phases: [
            {
              items: lineItems,
              iterations: 1,
              collection_method: 'send_invoice',
              discounts: [{ coupon: gift.coupon }],
              invoice_settings: {
                days_until_due: 14,
              },
              metadata: {
                [REPUBLIK_PAYMENTS_SUBSCRIPTION_REPLACES]: `monthly:${subScriptionId}`,
                [REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN]: 'GIFT',
              },
            },
          ],
        })
        return {
          company: 'PROJECT_R',
          aboType: 'YEARLY_SUBSCRIPION',
          starting: parseStripeDate(current_period_end),
        }
      }
    }
  }

  private async getCustomerId(
    cRepo: CustomerRepo,
    company: Company,
    userId: string,
  ) {
    let customerId = (await cRepo.getCustomerIdForCompany(userId, company))
      ?.customerId
    if (!customerId) {
      customerId = await this.#customerInfoService.createCustomer(
        company,
        userId,
      )
    }
    return customerId
  }

  private async getStripeSubscriptionId(
    internalId: string,
  ): Promise<string | null> {
    const res = await this.#pgdb.queryOne(
      `SELECT "externalId" from payments.subscriptions WHERE id = :id`,
      { id: internalId },
    )

    return res.externalId
  }

  private async getStripeIdForMonthlyAbo(
    internalId: string,
  ): Promise<string | null> {
    const res = await this.#pgdb.queryOne(
      `SELECT "subscriptionId" from memberships WHERE id = :id`,
      { id: internalId },
    )

    return res.subscriptionId
  }

  private async getMembershipEndDate(tx: PgDb, membershipId: string) {
    const latestMembershipPeriod = await tx.queryOne(
      `SELECT
            id,
            "endDate"
          FROM
            public."membershipPeriods"
          WHERE
            "membershipId" =
          ORDER BY
            "endDate" DESC NULLS LAST
          LIMIT 1;`,
      { membershipId: membershipId },
    )

    const endDate = dayjs(latestMembershipPeriod.endDate)
    return endDate
  }

  private cancelSubscriptionForUpgrade(stripeClient: Stripe, stripeId: string) {
    return stripeClient.subscriptions.update(stripeId, {
      cancellation_details: {
        comment:
          '[System]: cancelation because of upgrade to yearly subscription',
      },
      proration_behavior: 'none',
      metadata: {
        [REPUBLIK_PAYMENTS_CANCEL_REASON]: 'UPGRADE',
      },
      cancel_at_period_end: true,
    })
  }

  private async buildGiftItems(args: { offerId: string }): Promise<Item[]> {
    this.#offerService.isValidOffer(args.offerId)
    const companyName = this.#offerService.getOfferMerchent(args.offerId)

    const lookupKeys = this.#offerService
      .getOfferItems(args.offerId)
      .map((i) => i.lookupKey)

    const prices = await this.#paymentService.getPrices(
      companyName,
      lookupKeys ?? [],
    )
    const items: Item[] = prices.map((p) => ({ price: p.id, quantity: 1 }))

    return items
  }
}

function ensureCouponCanBeApplied(
  currentSub: Stripe.Response<Stripe.Subscription>,
  gift: Gift,
) {
  const coupons = currentSub.discounts.reduce<string[]>((acc, d) => {
    if (typeof d !== 'string') {
      return [d.coupon.id, ...acc]
    }
    return acc
  }, [])
  if (coupons.includes(gift.coupon)) {
    throw new GiftAlreadyAppliedError(gift.offer)
  }

  return true
}
