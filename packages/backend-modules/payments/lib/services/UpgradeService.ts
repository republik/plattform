import { PgDb } from 'pogi'
import { Logger } from '@orbiting/backend-modules-logger'
import { BillingRepo, PaymentBillingRepo } from '../database/BillingRepo'
import { PaymentService } from './PaymentService'
import { CancelationRepo } from '../database/CancelationRepo'
import { CustomerInfoService } from './CustomerInfoService'
import { SubscriptionUpgradeRepo } from '../database/SubscriptionUpgradeRepo'
import { User } from '@orbiting/backend-modules-types'
import Auth from '@orbiting/backend-modules-auth'
import { OfferService } from './OfferService'
import { activeOffers } from '../shop'
import { Company } from '../types'

type SubscriptionUpgrade = {
  status: string
  createdAt: Date
  updatedAt: Date
}

export class UpgradeService {
  private paymentService: PaymentService
  private customerInfoService: CustomerInfoService
  private billingRepo: PaymentBillingRepo
  private cancelationRepo: CancelationRepo
  private subsubscriptionUpgradeRepo: SubscriptionUpgradeRepo
  private offerService: OfferService
  private logger: Logger

  public constructor(pgdb: PgDb, logger: Logger) {
    this.paymentService = new PaymentService()
    this.customerInfoService = new CustomerInfoService(pgdb)
    this.billingRepo = new BillingRepo(pgdb)
    this.cancelationRepo = new CancelationRepo(pgdb)
    this.subsubscriptionUpgradeRepo = new SubscriptionUpgradeRepo(pgdb)
    this.offerService = new OfferService(activeOffers())
    this.logger = logger
  }

  public async cancelSubscriptionUpgrade(
    actor: User,
    subscriptionId: string,
  ): Promise<SubscriptionUpgrade> {
    this.logger.debug(
      { subscriptionId, actor },
      'scheduling subscription update',
    )

    const localSub = await this.billingRepo.getSubscription({
      id: subscriptionId,
    })

    Auth.Roles.userIsMeOrInRoles({ id: localSub?.userId }, actor, [
      'admin',
      'support',
    ])

    if (!localSub) {
      throw new Error('Unknown subscription')
    }

    const upgrades =
      await this.subsubscriptionUpgradeRepo.getUnresolvedSubscriptionUpgrades({
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

    await this.cancelationRepo.revokeLatestCancelation(localSub.id)
    await this.paymentService.updateSubscription(
      localSub.company,
      localSub.externalId,
      {
        cancel_at_period_end: false,
      },
    )

    return this.subsubscriptionUpgradeRepo.updateSubscriptionUpgrade(
      upgrade.id,
      {
        status: res.status,
      },
    )
  }

  public async nonInteractiveSubscriptionUpgrade(
    subscriptionId: string,
    args: { offerId: string; discount?: string },
  ) {
    this.logger.debug({ subscriptionId }, 'scheduling subscription update')
    this.offerService.isValidSubscriptionOffer(args.offerId)

    const localSub = await this.billingRepo.getSubscription({
      id: subscriptionId,
    })

    if (!localSub) {
      throw new Error('Unknown subscription')
    }

    if (await this.subscriptionHasUnresolvedUpgrades(subscriptionId)) {
      throw new Error('Subscription has unresoved upgrades')
    }

    const lookupKeys = this.offerService
      .getOfferItems(args.offerId)
      .map((i) => i.lookupKey)

    const companyName = this.offerService.getOfferMerchent(args.offerId)

    const targetCustomerId = await this.getCustomerId(
      companyName,
      localSub.userId,
    )
    const prices = await this.paymentService.getPrices(
      companyName,
      lookupKeys ?? [],
    )

    await this.cancelationRepo.insertCancelation(localSub.id, {
      category: 'SYSTEM',
      reason: 'Subscription Upgrade',
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

    const current_period_end = remoteSub.items.data[0].current_period_end

    const subscriptionType = this.offerService.getSubscriptionType(args.offerId)

    const upgrade =
      await this.subsubscriptionUpgradeRepo.saveSubscriptionUpgrade({
        userId: localSub.userId,
        subscriptionId: localSub.id,
        subscriptionType: subscriptionType,
        status: 'pending',
        scheduledStart: new Date(current_period_end * 1000),
      })

    const subSchedule = await this.paymentService.scheduleSubscription(
      companyName,
      targetCustomerId,
      {
        internalRef: `upgrade:${upgrade.id}`,
        items: prices.map((p) => ({ price: p.id, quantity: 1 })),
        startDate: current_period_end,
        collectionMethod: 'charge_automatically',
      },
    )

    return this.subsubscriptionUpgradeRepo.updateSubscriptionUpgrade(
      upgrade.id,
      {
        externalId: subSchedule.id,
        status: 'registered',
      },
    )
  }

  async userHasUnresolvedUpgrades(userId: string): Promise<boolean> {
    const upgrades =
      await this.subsubscriptionUpgradeRepo.getUnresolvedSubscriptionUpgrades({
        user_id: userId,
      })
    return upgrades.length > 0
  }

  async subscriptionHasUnresolvedUpgrades(subscriptionId: string) {
    const upgrades =
      await this.subsubscriptionUpgradeRepo.getUnresolvedSubscriptionUpgrades({
        subscription_id: subscriptionId,
      })
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
}
