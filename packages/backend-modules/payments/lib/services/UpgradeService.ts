import { PgDb } from 'pogi'
import { Logger } from '@orbiting/backend-modules-logger'
import { BillingRepo, PaymentBillingRepo } from '../database/BillingRepo'
import { Item, PaymentService } from './PaymentService'
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
import { LineItem } from '../shop/CheckoutSessionBuilder'

type SubscriptionUpgrade = {
  status: string
  createdAt: Date
  updatedAt: Date
}

export type SubscriptionUpgradeConfig = {
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

  public async getUpgrade(upgradeId: string) {
    return this.subscriptionUpgradeRepo.getSubscriptionUpgrade(upgradeId)
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
        internalRef: upgrade.id,
        items: items,
        add_invoice_items: additionalItems,
        discounts: this.offerService.buildDiscount(args.discount),
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

  public async markUpgradeAsProcessing(upgradeId: string) {
    return await this.subscriptionUpgradeRepo.updateSubscriptionUpgrade(
      upgradeId,
      {
        status: 'processing',
      },
    )
  }

  public async markUpgradeAsResolved(upgradeId: string) {
    return await this.subscriptionUpgradeRepo.updateSubscriptionUpgrade(
      upgradeId,
      {
        status: 'resolved',
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

  async previewInvoiceBreakdown(company: Company, upgradeId: string) {
    const upgrade = await this.getUpgrade(upgradeId)
    if (!upgrade) {
      return null
    }

    const { items, additionalItems } = await this.buildUpgradeItems(
      upgrade.upgradeConfig,
    )

    const discount = this.offerService.buildDiscount(
      upgrade.upgradeConfig.discount,
    )

    const invoicePreview = await this.paymentService.getInvoicePreview(
      company,
      {
        preview_mode: 'next',
        subscription_details: {
          items: items,
        },
        invoice_items: additionalItems,
        discounts: discount ?? [],
      },
    )

    return {
      total: invoicePreview.total,
      discount:
        invoicePreview.total_discount_amounts?.reduce((acc, d) => {
          return acc + d.amount
        }, 0) || 0,
      tax:
        invoicePreview.total_taxes?.reduce((acc, t) => {
          return acc + t.amount
        }, 0) || 0,
      startDate: upgrade.scheduledStart,
    }
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

  async buildUpgradeItems(
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

    if (
      args.donation !== undefined ||
      this.offerService.supportsDonations(args.offerId)
    ) {
      const donation = this.offerService.buildDonationItem(args.donation)
      this.logger.debug(donation, 'donation')
      if (donation?.type === 'Item') {
        items.push(donation.data)
      } else if (donation?.type === 'OnetimeItem')
        additionalItems.push(donation.data)
    }

    return { items, additionalItems }
  }
}
