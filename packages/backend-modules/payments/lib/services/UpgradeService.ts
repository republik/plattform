import { PgDb } from 'pogi'
import { Logger } from '../../../logger/build/@types'
import { BillingRepo, PaymentBillingRepo } from '../database/BillingRepo'
import { PaymentService } from './PaymentService'
import { CancelationRepo } from '../database/CancelationRepo'
import { CustomerInfoService } from './CustomerInfoService'
import { Upgrade, UpgradeRepo } from '../database/UpgradeRepo'
import { User } from '@orbiting/backend-modules-types'
import Auth from '@orbiting/backend-modules-auth'

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
  private upgradeRepo: UpgradeRepo
  private logger: Logger

  public constructor(pgdb: PgDb, logger: Logger) {
    this.paymentService = new PaymentService()
    this.customerInfoService = new CustomerInfoService(pgdb)
    this.billingRepo = new BillingRepo(pgdb)
    this.cancelationRepo = new CancelationRepo(pgdb)
    this.upgradeRepo = new UpgradeRepo(pgdb)
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

    const upgrade = await this.upgradeRepo.saveUpgrade({
      userId: localSub.userId,
      subscriptionId: localSub.id,
      status: 'pending',
      scheduledStart: new Date(remoteSub.current_period_end * 1000),
    })

    // we only allow upgrades to Project R
    const subSchedule = await this.paymentService.scheduleSubscription(
      'PROJECT_R',
      projectRCustomerId,
      {
        internalRef: `upgrade:${upgrade.id}`,
        items: [{ price: membershipPriceId.id, quantity: 1 }],
        startDate: remoteSub.current_period_end,
        collectionMethod: 'charge_automatically',
      },
    )

    return this.upgradeRepo.updateUpgrade(upgrade.id, {
      externalId: subSchedule.id,
      status: 'registered',
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

    const upgrades = await this.upgradeRepo.getUnresolvedUpgrades(localSub.id)

    if (upgrades.length === 0) {
      throw new Error('no upgrade to cancel')
    }

    const [upgrade] = upgrades

    const res = await this.paymentService.cancelScheduleSubscription(
      'PROJECT_R',
      upgrade.externalId,
    )

    return this.upgradeRepo.updateUpgrade(upgrade.id, {
      status: res.status,
    })
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
    const upgrades = await this.upgradeRepo.getUnresolvedUpgrades(
      subscriptionId,
    )
    return upgrades.length > 0
  }
}
