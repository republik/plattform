/* eslint-disable @typescript-eslint/no-unused-vars */
import { PgDb } from 'pogi'
import { Company } from '../types'
import Stripe from 'stripe'
import { CrockfordBase32 } from 'crockford-base32'
import { ProjectRStripe, RepublikAGStripe } from '../providers/stripe'
import { CustomerRepo } from '../database/CutomerRepo'
import { Payments } from '../payments'
import { Offers } from './offers'
import { Shop } from './Shop'
import dayjs from 'dayjs'
import { GiftVoucherRepo } from '../database/GiftVoucherRepo'
import createLogger from 'debug'
import { serializeMailSettings } from '../mail-settings'

const logger = createLogger('payments:gifts')

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

function normalizeVoucher(voucherCode: string): string | null {
  try {
    const code = CrockfordBase32.decode(voucherCode)
    return CrockfordBase32.encode(code)
  } catch {
    return null
  }
}

function newVoucherCode() {
  const bytes = new Uint8Array(5)
  crypto.getRandomValues(bytes)
  return CrockfordBase32.encode(Buffer.from(bytes))
}

const GIFTS: Gift[] = [
  {
    id: 'GIFT_YEARLY',
    duration: 1,
    durationUnit: 'year',
    offer: 'YEARLY',
    coupon: process.env.PAYMENTS_PROJECT_R_YEARLY_GIFT_COUPON!,
    company: 'PROJECT_R',
    value: 100,
    valueType: 'PERCENTAGE',
  },
  {
    id: 'MONTHLY_SUBSCRPTION_GIFT_3',
    duration: 3,
    durationUnit: 'month',
    offer: 'MONTHLY',
    coupon: process.env.PAYMENTS_REPUBLIK_MONTHLY_GIFT_3_COUPON!,
    company: 'REPUBLIK',
    value: 100,
    valueType: 'PERCENTAGE',
  },
]

export class GiftShop {
  #pgdb: PgDb
  #giftRepo: GiftVoucherRepo
  #stripeAdapters: Record<Company, Stripe> = {
    PROJECT_R: ProjectRStripe,
    REPUBLIK: RepublikAGStripe,
  }

  constructor(pgdb: PgDb) {
    this.#pgdb = pgdb
    this.#giftRepo = new GiftVoucherRepo(pgdb)
  }

  async generateNewVoucher(company: Company, giftId: string) {
    const voucher: Voucher = {
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

  async redeemVoucher(voucherCode: string, userId: string) {
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
    console.log(current?.type)
    try {
      const abo = await this.applyGift(userId, current, gift)

      await this.markVoucherAsRedeemed({
        voucher,
        userId,
        company: abo.company,
      })
    } catch (e) {
      if (e instanceof Error) {
        console.error(e)
      }
    }
  }

  private async applyGift(
    userId: string,
    current: { type: string; id: string } | null,
    gift: Gift,
  ) {
    if (!current) {
      // create new subscription with the gift if the user has none
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
        throw Error('Gifts not supported for this mabo')
    }
  }

  private async getGift(id: string) {
    return GIFTS.find((gift) => (gift.id = id)) || null
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
  ): Promise<{ company: Company }> {
    const cRepo = new CustomerRepo(this.#pgdb)
    const paymentService = Payments.getInstance()

    let customerId = (await cRepo.getCustomerIdForCompany(userId, gift.company))
      ?.customerId
    if (!customerId) {
      customerId = await paymentService.createCustomer(gift.company, userId)
    }

    const shop = new Shop(Offers)

    const offer = (await shop.getOfferById(gift.offer))!

    const subscription = await this.#stripeAdapters[
      gift.company
    ].subscriptions.create({
      customer: customerId,
      items: [shop.genLineItem(offer)],
      coupon: gift.coupon,
      collection_method: 'send_invoice',
      days_until_due: 14,
    })

    if (subscription.latest_invoice) {
      await this.#stripeAdapters[gift.company].invoices.finalizeInvoice(
        subscription.latest_invoice.toString(),
      )
    }
    return { company: gift.company }
  }

  private async applyGiftToMembershipAbo(
    _userId: string,
    membershipId: string,
    gift: Gift,
  ): Promise<{ id: string; company: Company }> {
    const tx = await this.#pgdb.transactionBegin()
    try {
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

      const newMembershipPeriod =
        await tx.public.membershipPeriods.insertAndGet({
          membershipId: membershipId,
          beginDate: endDate,
          endDate: endDate.add(gift.duration, gift.durationUnit),
          kind: 'GIFT',
        })

      logger('new membership period created %s', newMembershipPeriod.id)

      await tx.transactionCommit()

      return { id: membershipId, company: 'PROJECT_R' }
    } catch (e) {
      await tx.transactionRollback()
      throw e
    }
  }
  private async applyGiftToMonthlyAbo(
    userId: string,
    membershipId: string,
    gift: Gift,
  ): Promise<{ id: string; company: Company }> {
    const stripeId = await this.getStripeIdForMonthlyAbo(membershipId)

    if (!stripeId) {
      throw new Error(`membership ${membershipId} does not exist`)
    }

    switch (gift.company) {
      case 'REPUBLIK': {
        await this.#stripeAdapters.REPUBLIK.subscriptions.update(stripeId, {
          coupon: gift.coupon,
        })
        return { id: membershipId, company: 'REPUBLIK' }
      }
      case 'PROJECT_R': {
        const cRepo = new CustomerRepo(this.#pgdb)
        const paymentService = Payments.getInstance()

        let customerId = (
          await cRepo.getCustomerIdForCompany(userId, 'PROJECT_R')
        )?.customerId
        if (!customerId) {
          customerId = await paymentService.createCustomer('PROJECT_R', userId)
        }

        const shop = new Shop(Offers)
        const offer = (await shop.getOfferById(gift.offer))!

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
        const oldSub = await this.#stripeAdapters.REPUBLIK.subscriptions.update(
          stripeId,
          {
            cancellation_details: {
              comment:
                '[System]: cancelation because of upgrade to yearly subscription',
            },
            proration_behavior: 'none',
            metadata: {
              'republik.payments.mail.settings': serializeMailSettings({
                'notice:ended': false,
              }),
              'republik.payments.member': 'keep-on-cancel',
            },
            cancel_at_period_end: true,
          },
        )

        // create new subscription starting at the end period of the old one
        await this.#stripeAdapters.PROJECT_R.subscriptionSchedules.create({
          customer: customerId,
          start_date: oldSub.current_period_end,
          phases: [
            {
              items: [shop.genLineItem(offer)],
              iterations: 1,
              collection_method: 'send_invoice',
              coupon: gift.coupon,
              invoice_settings: {
                days_until_due: 14,
              },
              metadata: {
                'republik.payments.mail.settings': serializeMailSettings({
                  'confirm:setup': true,
                }),
                'republik.payments.upgrade-from': `monthly_abo:${membershipId}`,
              },
            },
          ],
        })
        return { id: membershipId, company: 'PROJECT_R' }
      }
    }
  }
  private async applyGiftToYearlyAbo(
    userId: string,
    id: string,
    gift: Gift,
  ): Promise<{ company: Company }> {
    const cRepo = new CustomerRepo(this.#pgdb)
    const paymentService = Payments.getInstance()

    let customerId = (await cRepo.getCustomerIdForCompany(userId, gift.company))
      ?.customerId
    if (!customerId) {
      customerId = await paymentService.createCustomer(gift.company, userId)
    }

    const latestMembershipPeriod = await this.#pgdb.queryOne(
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
      { membershipId: id },
    )

    const endDate = dayjs(latestMembershipPeriod.endDate)

    const shop = new Shop(Offers)

    const offer = (await shop.getOfferById(gift.offer))!

    await this.#stripeAdapters[gift.company].subscriptionSchedules.create({
      customer: customerId,
      start_date: endDate.unix(),
      phases: [
        {
          items: [shop.genLineItem(offer)],
          iterations: 1,
          collection_method: 'send_invoice',
          coupon: gift.coupon,
          invoice_settings: {
            days_until_due: 14,
          },
        },
      ],
    })

    return { company: gift.company }
  }
  private async applyGiftToBenefactor(
    _userId: string,
    id: string,
    _gift: Gift,
  ): Promise<{ id: string; company: Company }> {
    throw new Error('Not implemented')
    return { id: id, company: 'PROJECT_R' }
  }
  private async applyGiftToYearlySubscription(
    _userId: string,
    id: string,
    gift: Gift,
  ): Promise<{ id: string; company: Company }> {
    const stripeId = await this.getStripeSubscriptionId(id)

    if (!stripeId) {
      throw new Error(`yearly subscription ${id} does not exist`)
    }

    await this.#stripeAdapters.PROJECT_R.subscriptions.update(stripeId, {
      coupon: gift.coupon,
    })
    return { id: id, company: 'REPUBLIK' }
  }

  private async applyGiftToMonthlySubscription(
    userId: string,
    subScriptionId: string,
    gift: Gift,
  ): Promise<{ id: string; company: Company } | { company: Company }> {
    const stripeId = await this.getStripeSubscriptionId(subScriptionId)

    if (!stripeId) {
      throw new Error(`monthly subscription ${subScriptionId} does not exist`)
    }

    switch (gift.company) {
      case 'REPUBLIK': {
        await this.#stripeAdapters.REPUBLIK.subscriptions.update(stripeId, {
          coupon: gift.coupon,
        })
        return { id: subScriptionId, company: 'REPUBLIK' }
      }
      case 'PROJECT_R': {
        const cRepo = new CustomerRepo(this.#pgdb)
        const paymentService = Payments.getInstance()

        let customerId = (
          await cRepo.getCustomerIdForCompany(userId, 'PROJECT_R')
        )?.customerId
        if (!customerId) {
          customerId = await paymentService.createCustomer('PROJECT_R', userId)
        }

        const shop = new Shop(Offers)
        const offer = (await shop.getOfferById(gift.offer))!

        //cancel old monthly subscription on Republik AG
        const oldSub = await this.#stripeAdapters.REPUBLIK.subscriptions.update(
          stripeId,
          {
            cancellation_details: {
              comment:
                '[System]: cancelation because of upgrade to yearly subscription',
            },
            proration_behavior: 'none',
            metadata: {
              'republik.payments.mail.settings': serializeMailSettings({
                'notice:ended': false,
              }),
              'republik.payments.member': 'keep-on-cancel',
            },
            cancel_at_period_end: true,
          },
        )

        // create new subscription starting at the end period of the old one
        await this.#stripeAdapters.PROJECT_R.subscriptionSchedules.create({
          customer: customerId,
          start_date: oldSub.current_period_end,
          phases: [
            {
              items: [shop.genLineItem(offer)],
              iterations: 1,
              collection_method: 'send_invoice',
              coupon: gift.coupon,
              invoice_settings: {
                days_until_due: 14,
              },
              metadata: {
                'republik.payments.mail.settings': serializeMailSettings({
                  'confirm:setup': true,
                }),
                'republik.payments.upgrade-from': `monthly:${subScriptionId}`,
              },
            },
          ],
        })
        return { company: 'PROJECT_R' }
      }
    }
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
}
