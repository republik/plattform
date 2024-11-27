/* eslint-disable @typescript-eslint/no-unused-vars */
import { PgDb } from 'pogi'
import { Company } from '../types'
import Stripe from 'stripe'
import { ProjectRStripe, RepublikAGStripe } from '../providers/stripe'
import { CustomerRepo } from '../database/CutomerRepo'
import { Payments } from '../payments'
import { Offers } from './offers'
import { Shop } from './Shop'

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

type Voucher = {
  id: string
  code: string
  giftId: string
  issuedBy: Company
  redeemedBy: string | null
  redeemedForCompany: Company | null
  state: 'unredeemed' | 'redeemed'
}

type PLEDGE_ABOS = 'ABO' | 'MONTHLY_ABO' | 'YEARLY_ABO' | 'BENEFACTOR_ABO'
type SUBSCRIPTIONS = 'YEARLY_SUBSCRIPTION' | 'MONTHLY_SUBSCRIPTION'
type PRODUCT_TYPE = PLEDGE_ABOS | SUBSCRIPTIONS

const GIFTS: Gift[] = [
  {
    id: 'YEARLY_SUBSCRPTION_GIFT',
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

export class GiftRepo {
  #store: Voucher[] = [
    {
      id: '1',
      code: 'AAABBBCCC',
      giftId: 'YEARLY_SUBSCRPTION_GIFT',
      issuedBy: 'PROJECT_R',
      state: 'unredeemed',
      redeemedBy: null,
      redeemedForCompany: null,
    },
    {
      id: '1',
      code: 'XXXYYYZZZ',
      giftId: 'MONTHLY_SUBSCRPTION_GIFT_3',
      issuedBy: 'REPUBLIK',
      state: 'unredeemed',
      redeemedBy: null,
      redeemedForCompany: null,
    },
  ]

  async getVoucher(code: string) {
    return this.#store.find((g) => g.code === code && g.state === 'unredeemed')
  }
}

export class GiftShop {
  #pgdb: PgDb
  #giftRepo = new GiftRepo()
  #stripeAdapters: Record<Company, Stripe> = {
    PROJECT_R: ProjectRStripe,
    REPUBLIK: RepublikAGStripe,
  }

  constructor(pgdb: PgDb) {
    this.#pgdb = pgdb
  }

  async redeemVoucher(voucherCode: string, userId: string) {
    const voucher = await this.#giftRepo.getVoucher(voucherCode)

    if (!voucher) {
      throw new Error('voucher is invalid')
    }

    if (voucher.state === 'redeemed') {
      throw new Error('gift has already been redeemed')
    }

    const gift = await this.getGift(voucher.giftId)
    if (!gift) {
      throw new Error('unknown gift unsuspected system error')
    }

    const current = await this.getCurrentUserAbo(userId)
    console.log(current?.type)
    try {
      await (async () => {
        switch (current?.type) {
          case null:
          case undefined:
            return this.applyGiftToNewSubscription(userId, gift)
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
            throw Error('Match error')
        }
      })()

      await this.markGiftAsRedeemed(gift)
    } catch (e) {
      if (e instanceof Error) {
        console.error(e)
      }
    }
  }

  private async getGift(id: string) {
    return GIFTS.find((gift) => (gift.id = id)) || null
  }

  private async markGiftAsRedeemed(_gift: Gift) {
    throw new Error('Not implemented')
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

  private async applyGiftToNewSubscription(userId: string, gift: Gift) {
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
      metadata: {
        'republik.payments.started-as': 'gift',
      },
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
    return
  }

  private async applyGiftToMembershipAbo(
    _userId: string,
    _membershipId: string,
    _gift: Gift,
  ) {
    throw new Error('Not implemented')
    return
  }
  private async applyGiftToMonthlyAbo(
    _userId: string,
    _membershipId: string,
    _gift: Gift,
  ) {
    throw new Error('Not implemented')
    return
  }
  private async applyGiftToYearlyAbo(
    _userId: string,
    _id: string,
    _gift: Gift,
  ) {
    throw new Error('Not implemented')
    return
  }
  private async applyGiftToBenefactor(
    _userId: string,
    _id: string,
    _gift: Gift,
  ) {
    throw new Error('Not implemented')
    return
  }
  private async applyGiftToYearlySubscription(
    _userId: string,
    id: string,
    gift: Gift,
  ) {
    const stripeId = await this.getStripeSubscriptionId(id)

    if (!stripeId) {
      throw new Error(`yearly subscription ${id} does not exist`)
    }

    await this.#stripeAdapters.PROJECT_R.subscriptions.update(stripeId, {
      coupon: gift.coupon,
    })
    return
  }

  private async applyGiftToMonthlySubscription(
    userId: string,
    subScriptionId: string,
    gift: Gift,
  ) {
    const stripeId = await this.getStripeSubscriptionId(subScriptionId)

    if (!stripeId) {
      throw new Error(`monthly subscription ${subScriptionId} does not exist`)
    }

    switch (gift.company) {
      case 'REPUBLIK': {
        await this.#stripeAdapters.REPUBLIK.subscriptions.update(stripeId, {
          coupon: gift.coupon,
        })
        return
      }
      case 'PROJECT_R': {
        const cRepo = new CustomerRepo(this.#pgdb)
        const paymentService = Payments.getInstance()

        let customerId = (
          await cRepo.getCustomerIdForCompany(userId, gift.company)
        )?.customerId
        if (!customerId) {
          customerId = await paymentService.createCustomer(gift.company, userId)
        }

        const shop = new Shop(Offers)

        const offer = (await shop.getOfferById(gift.offer))!

        const oldSub = await this.#stripeAdapters.REPUBLIK.subscriptions.update(
          stripeId,
          {
            cancellation_details: {
              comment: 'system cancelation because of update',
            },
            proration_behavior: 'none',
            metadata: {
              'republik.payments.mailing': 'no-cancel',
              'republik.payments.member': 'keep-on-cancel',
            },
            cancel_at_period_end: true,
          },
        )

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
                'republik.payments.started-as': 'gift',
              },
            },
          ],
        })
        return
      }
    }

    throw new Error('Not implemented')
    return
  }

  private async getStripeSubscriptionId(
    internalId: string,
  ): Promise<string | null> {
    const res = await this.#pgdb.queryOne(
      `SELECT "externalId" from payments.subscriptions WHERE id = :id`,
      { id: internalId },
    )

    console.log(res)

    return res.externalId
  }
}
