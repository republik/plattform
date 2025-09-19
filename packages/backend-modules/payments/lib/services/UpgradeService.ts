import { PgDb } from 'pogi'
import { Logger } from '@orbiting/backend-modules-logger'
import { BillingRepo, PaymentBillingRepo } from '../database/BillingRepo'
import { PaymentService } from './PaymentService'
import { CancelationRepo } from '../database/CancelationRepo'
import { CustomerInfoService } from './CustomerInfoService'
import {
  Upgrade,
  SubscriptionUpgradeRepo,
} from '../database/SubscriptionUpgradeRepo'
import { User } from '@orbiting/backend-modules-types'
import Auth from '@orbiting/backend-modules-auth'
import { getSubscriptionType } from '../handlers/stripe/utils'

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
  private logger: Logger

  public constructor(pgdb: PgDb, logger: Logger) {
    this.paymentService = new PaymentService()
    this.customerInfoService = new CustomerInfoService(pgdb)
    this.billingRepo = new BillingRepo(pgdb)
    this.cancelationRepo = new CancelationRepo(pgdb)
    this.subsubscriptionUpgradeRepo = new SubscriptionUpgradeRepo(pgdb)
    this.logger = logger
  }

  public async scheduleSubscriptionUpgrade(
    actor: User,
    subscriptionId: string,
  ): Promise<Upgrade> {
    this.logger.debug(
      { subscriptionId, actor: actor.id },
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

    if (localSub.type != 'MONTHLY_SUBSCRIPTION') {
      throw new Error('Upgrades are only support for monthly subscriptions')
    }

    if (await this.hasUnresolvedUpgrades(subscriptionId)) {
      throw new Error('Subscription has unresoved upgrades')
    }

    const projectRCustomerId = await this.getProjectRCustomerId(localSub.userId)
    const [membershipPriceId] = await this.paymentService.getPrices(
      'PROJECT_R',
      ['ABO'],
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

    const current_end = remoteSub.items.data[0]?.current_period_end

    const upgrade =
      await this.subsubscriptionUpgradeRepo.saveSubscriptionUpgrade({
        userId: localSub.userId,
        subscriptionId: localSub.id,
        status: 'pending',
        scheduledStart: new Date(current_end * 1000),
      })

    // we only allow upgrades to Project R
    const subSchedule = await this.paymentService.scheduleSubscription(
      'PROJECT_R',
      projectRCustomerId,
      {
        internalRef: `upgrade:${upgrade.id}`,
        items: [{ price: membershipPriceId.id, quantity: 1 }],
        startDate: current_end,
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
      await this.subsubscriptionUpgradeRepo.getUnresolvedSubscriptionUpgrades(
        localSub.id,
      )

    if (upgrades.length === 0) {
      throw new Error('no upgrade to cancel')
    }

    const [upgrade] = upgrades

    const res = await this.paymentService.cancelScheduleSubscription(
      'PROJECT_R',
      upgrade.externalId,
    )

    return this.subsubscriptionUpgradeRepo.updateSubscriptionUpgrade(
      upgrade.id,
      {
        status: res.status,
      },
    )
  }

  public async nonInteractiveSubscriptionUpgrade(subscriptionId: string) {
    this.logger.debug({ subscriptionId }, 'scheduling subscription update')

    const localSub = await this.billingRepo.getSubscription({
      id: subscriptionId,
    })

    if (!localSub) {
      throw new Error('Unknown subscription')
    }

    if (localSub.type != 'MONTHLY_SUBSCRIPTION') {
      throw new Error('Upgrades are only support for monthly subscriptions')
    }

    if (await this.hasUnresolvedUpgrades(subscriptionId)) {
      throw new Error('Subscription has unresoved upgrades')
    }

    const projectRCustomerId = await this.getProjectRCustomerId(localSub.userId)
    const [subscriptionPrice] = await this.paymentService.getPrices(
      'PROJECT_R',
      ['ABO'],
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

    const upgrade =
      await this.subsubscriptionUpgradeRepo.saveSubscriptionUpgrade({
        userId: localSub.userId,
        subscriptionId: localSub.id,
        subscriptionType: getSubscriptionType(subscriptionPrice.id),
        status: 'pending',
        scheduledStart: new Date(current_period_end * 1000),
      })

    // we only allow upgrades to Project R
    const subSchedule = await this.paymentService.scheduleSubscription(
      'PROJECT_R',
      projectRCustomerId,
      {
        internalRef: `upgrade:${upgrade.id}`,
        items: [{ price: subscriptionPrice.id, quantity: 1 }],
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

  private async getProjectRCustomerId(userId: string) {
    const customer = await this.customerInfoService.getCustomerIdForCompany(
      userId,
      'PROJECT_R',
    )
    if (customer !== null) {
      return customer.customerId
    }

    return await this.customerInfoService.createCustomer('PROJECT_R', userId)
  }

  private async hasUnresolvedUpgrades(subscriptionId: string) {
    const upgrades =
      await this.subsubscriptionUpgradeRepo.getUnresolvedSubscriptionUpgrades(
        subscriptionId,
      )
    return upgrades.length > 0
  }
}
