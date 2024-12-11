import { PgDb } from 'pogi'
import { NOT_STARTED_STATUS_TYPES, ACTIVE_STATUS_TYPES } from '../types'
import {
  sendCancelConfirmationMail,
  sendEndedNoticeMail,
  sendPaymentFailedNoticeMail,
  sendRevokeCancellationConfirmationMail,
  sendSetupSubscriptionMail,
} from '../transactionals/sendTransactionalMails'
import { UserDataRepo } from '../database/UserRepo'
import { BillingRepo } from '../database/BillingRepo'
import { enforceSubscriptions } from '@orbiting/backend-modules-mailchimp'

export class MailNotificationService {
  #pgdb: PgDb
  #users: UserDataRepo
  #billing: BillingRepo

  constructor(pgdb: PgDb) {
    this.#pgdb = pgdb
    this.#users = new UserDataRepo(pgdb)
    this.#billing = new BillingRepo(pgdb)
  }

  async sendSetupSubscriptionTransactionalMail({
    subscriptionExternalId,
    userId,
    invoiceId,
  }: {
    subscriptionExternalId: string
    userId: string
    invoiceId: string
  }): Promise<void> {
    const subscription = await this.#billing.getSubscription({
      externalId: subscriptionExternalId,
    })

    if (!subscription) {
      throw new Error(
        `Subscription [${subscriptionExternalId}] does not exist in the Database`,
      )
    }

    if (!ACTIVE_STATUS_TYPES.includes(subscription.status)) {
      throw new Error(
        `not sending transactional for subscription ${subscriptionExternalId} with status ${subscription.status}`,
      )
    }
    const userRow = await this.#users.findUserById(userId)
    if (!userRow) {
      throw new Error('unknown user')
    }

    const invoice = await this.#billing.getInvoice({ id: invoiceId })
    if (!invoice) {
      throw new Error(
        `Invoice ${invoiceId} does not exist in the database, not able to send subscription setup confirmation transactional mail.`,
      )
    }
    // send mail
    await sendSetupSubscriptionMail(
      { subscription, invoice, email: userRow.email },
      this.#pgdb,
    )
  }

  async sendCancelConfirmationTransactionalMail({
    subscriptionExternalId,
    userId,
  }: {
    subscriptionExternalId: string
    userId: string
  }): Promise<void> {
    const subscription = await this.#billing.getSubscription({
      externalId: subscriptionExternalId,
    })

    const userRow = await this.#users.findUserById(userId)

    if (!subscription) {
      throw new Error(
        `Subscription [${subscriptionExternalId}] does not exist in the Database`,
      )
    }

    if (!ACTIVE_STATUS_TYPES.includes(subscription.status)) {
      throw new Error(
        `not sending cancellation confirmation transactional for subscription ${subscriptionExternalId} with status ${subscription.status}`,
      )
    }

    if (!subscription.cancelAt || !subscription.canceledAt) {
      throw new Error(
        `Subscription ${subscriptionExternalId} is not cancelled, not sending cancellation confirmation transactional`,
      )
    }

    if (!userRow?.email) {
      throw new Error(
        `Could not find email for user with id ${userId}, not sending cancellation confirmation transactional`,
      )
    }

    await sendCancelConfirmationMail(
      {
        endDate: subscription.cancelAt,
        cancellationDate: subscription.canceledAt,
        type: subscription.type,
        userId: userId,
        email: userRow.email,
      },
      this.#pgdb,
    )
  }

  async sendRevokeCancellationConfirmationTransactionalMail({
    subscriptionExternalId,
    userId,
    revokedCancellationDate,
  }: {
    subscriptionExternalId: string
    userId: string
    revokedCancellationDate: Date
  }): Promise<void> {
    const subscription = await this.#billing.getSubscription({
      externalId: subscriptionExternalId,
    })

    const userRow = await this.#users.findUserById(userId)
    if (!userRow) {
      throw new Error('unknown user')
    }

    if (!subscription) {
      throw new Error(
        `Subscription [${subscriptionExternalId}] does not exist in the Database`,
      )
    }

    if (subscription.cancelAt) {
      throw new Error(
        `Subscription ${subscriptionExternalId} is still cancelled, not sending revoke cancellation confirmation transactional`,
      )
    }

    if (!userRow.email) {
      throw new Error(
        `Could not find email for user with id ${userId}, not sending revoke cancellation confirmation transactional`,
      )
    }

    await sendRevokeCancellationConfirmationMail(
      {
        currentEndDate: subscription.currentPeriodEnd,
        revokedCancellationDate,
        type: subscription.type,
        userId,
        email: userRow.email,
      },
      this.#pgdb,
    )
  }

  async sendSubscriptionEndedNoticeTransactionalMail({
    userId,
    subscriptionExternalId,
    cancellationReason,
  }: {
    userId: string
    subscriptionExternalId: string
    cancellationReason?: string
  }): Promise<void> {
    const subscription = await this.#billing.getSubscription({
      externalId: subscriptionExternalId,
    })

    const userRow = await this.#users.findUserById(userId)

    if (!subscription) {
      throw new Error(
        `Subscription [${subscriptionExternalId}] does not exist in the Database`,
      )
    }

    if (ACTIVE_STATUS_TYPES.includes(subscription.status)) {
      throw new Error(
        `not sending ended notice transactional for subscription ${subscriptionExternalId} with status ${subscription.status}`,
      )
    }

    if (!subscription.endedAt) {
      throw new Error(
        `Subscription ${subscriptionExternalId} has not ended, not sending ended notice transactional`,
      )
    }

    if (!userRow?.email) {
      throw new Error(
        `Could not find email for user with id ${userId}, not sending ended notice transactional`,
      )
    }

    await sendEndedNoticeMail(
      { subscription, cancellationReason, email: userRow.email },
      this.#pgdb,
    )
  }

  async sendNoticePaymentFailedTransactionalMail({
    userId,
    subscriptionExternalId,
    invoiceExternalId,
  }: {
    userId: string
    subscriptionExternalId: string
    invoiceExternalId: string
  }): Promise<void> {
    const subscription = await this.#billing.getSubscription({
      externalId: subscriptionExternalId,
    })

    const invoice = await this.#billing.getInvoice({
      externalId: invoiceExternalId,
    })

    const userRow = await this.#users.findUserById(userId)

    if (!subscription) {
      throw new Error(
        `Subscription [${subscriptionExternalId}] does not exist in the Database`,
      )
    }

    if (!invoice) {
      throw new Error(
        `Invoice ${invoiceExternalId} does not exist in the Database`,
      )
    }

    if (!ACTIVE_STATUS_TYPES.includes(subscription.status)) {
      throw new Error(
        `not sending payment failed notice transactional for subscription ${subscriptionExternalId} with status ${subscription.status}`,
      )
    }

    if (invoice.status !== 'open') {
      throw new Error(
        `not sending payment failed notice transactional for subscription ${subscriptionExternalId}, invoice ${invoiceExternalId} is not in state open but ${invoice.status}`,
      )
    }

    if (subscription.endedAt) {
      throw new Error(
        `Subscription ${subscriptionExternalId} has ended, not sending failed payment notice transactional`,
      )
    }

    if (!userRow?.email) {
      throw new Error(
        `Could not find email for user with id ${userId}, not sending failed payment notice transactional`,
      )
    }

    await sendPaymentFailedNoticeMail(
      { subscription, invoice, email: userRow.email },
      this.#pgdb,
    )
  }

  async syncMailchimpSetupSubscription({
    userId,
    subscriptionExternalId,
  }: {
    userId: string
    subscriptionExternalId: string
  }): Promise<void> {
    const subscribeToOnboardingMails = await this.isUserFirstTimeSubscriber(
      userId,
      subscriptionExternalId,
    )

    // sync to mailchimp
    await enforceSubscriptions({
      userId: userId,
      subscribeToOnboardingMails: subscribeToOnboardingMails,
      subscribeToEditorialNewsletters: true,
      pgdb: this.#pgdb,
    })
  }

  async syncMailchimpUpdateSubscription({
    userId,
  }: {
    userId: string
  }): Promise<void> {
    // sync to mailchimp
    await enforceSubscriptions({
      userId: userId,
      subscribeToOnboardingMails: false,
      subscribeToEditorialNewsletters: false,
      pgdb: this.#pgdb,
    })
  }

  private async isUserFirstTimeSubscriber(
    userId: string,
    subscriptionExternalId: string,
  ): Promise<boolean> {
    const memberships = await this.#pgdb.public.memberships.find({
      userId: userId,
    })
    const subscriptions = await this.#pgdb.payments.subscriptions.find({
      'externalId !=': subscriptionExternalId,
      status: NOT_STARTED_STATUS_TYPES,
    })
    return !(memberships?.length > 0 || subscriptions?.length > 0)
  }
}
