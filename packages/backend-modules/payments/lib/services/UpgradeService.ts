import { PgDb } from 'pogi'
import { Logger } from '@orbiting/backend-modules-logger'
import { BillingRepo, PaymentBillingRepo } from '../database/BillingRepo'
import { Item, OnetimeItem, PaymentService } from './PaymentService'
import { CancelationRepo } from '../database/CancelationRepo'
import { CustomerInfoService } from './CustomerInfoService'
import {
  SubscriptionUpgradeRepo,
  Upgrade,
} from '../database/SubscriptionUpgradeRepo'
import { User } from '@orbiting/backend-modules-types'
import Auth from '@orbiting/backend-modules-auth'
import { OfferService } from './OfferService'
import { activeOffers } from '../shop'
import { Company, DiscountOption, Subscription } from '../types'
import { getConfig } from '../config'
import { CustomDonation, LineItem } from '../shop/CheckoutSessionOptionBuilder'

type TypedData<K, T> = { type: K; data: T }

type SubscriptionUpgrade = {
  status: string
  createdAt: Date
  updatedAt: Date
}

type SubscriptionUpgradeConfig = {
  offerId: string
  discount?: DiscountOption
  donation?: { amount: number }
  promoCode?: string
  metadata?: Record<string, string | number | null>
}

const CANCELATION_DATA = {
  CATEGORY: 'SYSTEM',
  REASON: 'Subscription Upgrade',
} as const

export class UpgradeService {
  private paymentService: PaymentService
  private customerInfoService: CustomerInfoService
  private billingRepo: PaymentBillingRepo
  private cancelationRepo: CancelationRepo
  private subscriptionUpgradeRepo: SubscriptionUpgradeRepo
  private offerService: OfferService
  private logger: Logger

  public constructor(pgdb: PgDb, logger: Logger) {
    this.paymentService = new PaymentService()
    this.customerInfoService = new CustomerInfoService(pgdb)
    this.billingRepo = new BillingRepo(pgdb)
    this.cancelationRepo = new CancelationRepo(pgdb)
    this.subscriptionUpgradeRepo = new SubscriptionUpgradeRepo(pgdb)
    this.offerService = new OfferService(activeOffers())
    this.logger = logger
  }

  public async initializeSubscriptionUpgrade(
    userId: string,
    subscriptionId: string,
    args: SubscriptionUpgradeConfig,
  ) {
    this.offerService.isValidSubscriptionOffer(args.offerId)
    const subscriptionType = this.offerService.getSubscriptionType(args.offerId)
    const subscription = await this.validateSubscriptionCanBeUpgraded(
      subscriptionId,
    )

    return await this.subscriptionUpgradeRepo.saveSubscriptionUpgrade({
      userId: userId,
      subscriptionId: subscription.id,
      subscriptionType: subscriptionType,
      upgradeConfig: args,
      status: 'initialized',
    })
  }

  public async cancelSubscriptionUpgrade(
    actor: User,
    subscriptionId: string,
  ): Promise<SubscriptionUpgrade> {
    this.logger.debug(
      { subscriptionId, actor },
      'scheduling subscription update',
    )

    const localSub = await this.validateSubscriptionOwnership(
      subscriptionId,
      actor,
    )

    const upgrades =
      await this.subscriptionUpgradeRepo.getUnresolvedSubscriptionUpgrades({
        subscription_id: localSub.id,
      })

    if (upgrades.length === 0) {
      throw new Error('no upgrade to cancel')
    }

    const [upgrade] = upgrades

    const res = await this.paymentService.cancelScheduleSubscription(
      'PROJECT_R',
      upgrade.externalId,
    )

    const systemCancelation = await this.cancelationRepo.getOne(
      {
        subscriptionId: subscriptionId,
        category: CANCELATION_DATA.CATEGORY,
        reason: CANCELATION_DATA.REASON,
        revokedAt: null,
      },
      { createdAt: 'desc' },
    )
    if (systemCancelation) {
      await this.cancelationRepo.updateCancelation(systemCancelation.id, {
        revokedAt: new Date(),
      })
      await this.paymentService.updateSubscription(
        localSub.company,
        localSub.externalId,
        {
          cancel_at_period_end: false,
        },
      )
    } else {
      this.logger.info(
        { subscriptionId: subscriptionId },
        'no system cancelation found. Keeping cancelation state in place',
      )
    }

    return this.subscriptionUpgradeRepo.updateSubscriptionUpgrade(upgrade.id, {
      status: res.status,
    })
  }

  public async nonInteractiveSubscriptionUpgrade(upgradeId: string) {
    let upgrade = await this.markUpgradeAsProcessing(upgradeId)
    const subscription = await this.validateNoOtherUpgradesAreInProgress(
      upgrade,
    )
    const args = upgrade.upgradeConfig as SubscriptionUpgradeConfig

    this.logger.debug(
      { subscriptionId: upgrade.subscriptionId },
      'scheduling subscription update',
    )

    this.offerService.isValidSubscriptionOffer(args.offerId)

    const { cancelAt: scheduledStart } = await this.registerUpgradeCancelation(
      subscription,
    )

    upgrade = await this.subscriptionUpgradeRepo.updateSubscriptionUpgrade(
      upgrade.id,
      {
        subscriptionId: subscription.id,
        status: 'pending',
        scheduledStart: new Date(scheduledStart * 1000),
      },
    )

    const { items, additionalItems } = await this.buildUpgradeItems(args)

    const companyName = this.offerService.getOfferMerchent(args.offerId)
    const subscriptionUpgrade = await this.paymentService.scheduleSubscription(
      companyName,
      await this.getCustomerId(companyName, subscription.userId),
      {
        internalRef: `upgrade:${upgrade.id}`,
        items: items,
        add_invoice_items: additionalItems,
        discounts: await this.buildUpgradeDiscounts(args),
        startDate: scheduledStart,
        metadata: args.metadata,
        collectionMethod: 'charge_automatically',
      },
    )

    return this.subscriptionUpgradeRepo.updateSubscriptionUpgrade(upgrade.id, {
      externalId: subscriptionUpgrade.id,
      status: 'registered',
    })
  }

  private async markUpgradeAsProcessing(upgradeId: string) {
    return await this.subscriptionUpgradeRepo.updateSubscriptionUpgrade(
      upgradeId,
      {
        status: 'processing',
      },
    )
  }

  async hasUnresolvedUpgrades(
    select:
      | {
          'id !='?: string
          subscription_id: string
          user_id?: never
        }
      | {
          'id !='?: string
          subscription_id?: never
          user_id: string
        },
  ) {
    const upgrades =
      await this.subscriptionUpgradeRepo.getUnresolvedSubscriptionUpgrades(
        select,
      )
    return upgrades.length > 0
  }

  private async getCustomerId(company: Company, userId: string) {
    const customer = await this.customerInfoService.getCustomerIdForCompany(
      userId,
      company,
    )
    if (customer !== null) {
      return customer.customerId
    }

    return await this.customerInfoService.createCustomer(company, userId)
  }

  private async validateSubscriptionOwnership(
    subscriptionId: string,
    actor: User,
  ) {
    const localSub = await this.getSubscription(subscriptionId)

    Auth.Roles.userIsMeOrInRoles({ id: localSub?.userId }, actor, [
      'admin',
      'support',
    ])

    return localSub
  }

  private async getSubscription(subscriptionId: string): Promise<Subscription> {
    const localSub = await this.billingRepo.getSubscription({
      id: subscriptionId,
    })

    if (!localSub) {
      throw new Error('Unknown subscription')
    }

    return localSub
  }

  private async registerUpgradeCancelation(
    localSub: Subscription,
  ): Promise<{ cancelAt: number }> {
    if (localSub.cancelAtPeriodEnd && localSub.cancelAt) {
      return { cancelAt: Math.floor(localSub.cancelAt.getTime() / 1000) }
    }

    await this.cancelationRepo.insertCancelation(localSub.id, {
      category: CANCELATION_DATA.CATEGORY,
      reason: CANCELATION_DATA.REASON,
      suppressConfirmation: true,
      suppressWinback: true,
    })

    const remoteSub = await this.paymentService.updateSubscription(
      localSub.company,
      localSub.externalId,
      {
        cancel_at_period_end: true,
      },
    )

    return { cancelAt: remoteSub.cancel_at! }
  }

  private async validateSubscriptionCanBeUpgraded(subscriptionId: string) {
    const localSub = await this.billingRepo.getSubscription({
      id: subscriptionId,
    })

    if (!localSub) {
      throw new Error('Unknown subscription')
    }

    if (await this.hasUnresolvedUpgrades({ subscription_id: subscriptionId })) {
      throw new Error('Subscription has unresoved upgrades')
    }
    return localSub
  }

  private async validateNoOtherUpgradesAreInProgress(
    upgrade: Upgrade,
  ): Promise<Subscription> {
    const inProgress = await this.hasUnresolvedUpgrades({
      'id !=': upgrade.id,
      subscription_id: upgrade.subscriptionId,
    })
    if (inProgress) {
      throw new Error('Other Upgrade in progress')
    }

    const subscription = await this.billingRepo.getSubscription({
      id: upgrade.subscriptionId,
    })

    if (!subscription) {
      throw new Error('Unknown subscription')
    }

    return subscription
  }

  private async buildUpgradeItems(
    args: SubscriptionUpgradeConfig,
  ): Promise<{ items: Item[]; additionalItems: LineItem[] }> {
    this.offerService.isValidOffer(args.offerId)
    const companyName = this.offerService.getOfferMerchent(args.offerId)

    const lookupKeys = this.offerService
      .getOfferItems(args.offerId)
      .map((i) => i.lookupKey)

    const prices = await this.paymentService.getPrices(
      companyName,
      lookupKeys ?? [],
    )
    const items: Item[] = prices.map((p) => ({ price: p.id, quantity: 1 }))
    const additionalItems: LineItem[] = []

    this.logger.debug(args.donation, 'donation amount')

    if (
      !args.donation === undefined ||
      this.offerService.supportsDonations(args.offerId)
    ) {
      const donation = this.buildDonationItem(args.donation)
      this.logger.debug(donation, 'donation')
      if (donation?.type === 'Item') {
        items.push(donation.data)
      } else if (donation?.type === 'OnetimeItem')
        additionalItems.push(donation.data)
    }

    return { items, additionalItems }
  }

  private async buildUpgradeDiscounts(
    args: SubscriptionUpgradeConfig,
  ): Promise<{ promotion_code: string }[] | { coupon: string }[]> {
    this.offerService.isValidOffer(args.offerId)

    if (!args.discount) {
      return []
    }

    const discount = args.discount

    if (discount.type === 'DISCOUNT') {
      return [{ coupon: discount.value.id }]
    }
    if (discount.type === 'PROMO') {
      return [{ promotion_code: discount.value.id }]
    }
    return []
  }

  private buildDonationItem(
    donation?: CustomDonation,
  ): TypedData<'Item', Item> | TypedData<'OnetimeItem', OnetimeItem> | null {
    if (!donation || !donation.recurring || donation.amount < 0) return null

    if (!donation.recurring) {
      return {
        type: 'OnetimeItem',
        data: {
          price_data: {
            product: getConfig().PROJECT_R_DONATION_PRODUCT_ID,
            unit_amount: donation.amount,
            currency: 'CHF',
          },
          quantity: 1,
        },
      }
    }

    return {
      type: 'Item',
      data: {
        price_data: {
          product: getConfig().PROJECT_R_DONATION_PRODUCT_ID,
          unit_amount: donation.amount,
          currency: 'CHF',
          recurring: {
            interval: 'year',
            interval_count: 1,
          },
        },
        quantity: 1,
      },
    }
  }
}
