import Stripe from 'stripe'
import { Company, MailNotifier, Order, PaymentWorkflow } from '../../types'
import { ConfirmSetupTransactionalWorker } from '../../workers/ConfirmSetupTransactionalWorker'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { SyncMailchimpSetupWorker } from '../../workers/SyncMailchimpSetupWorker'
import { mapSubscriptionArgs } from './subscriptionCreated'
import { mapInvoiceArgs } from './invoiceCreated'
// import { mapChargeArgs } from './invoicePaymentSucceeded'
import { GiftShop, Voucher } from '../../shop/gifts'
import { sendGiftPurchaseMail } from '../../transactionals/sendTransactionalMails'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { CustomerInfoService } from '../../services/CustomerInfoService'
import { SubscriptionService } from '../../services/SubscriptionService'
import { InvoiceService } from '../../services/InvoiceService'
import { PaymentService } from '../../services/PaymentService'
import { UserService } from '../../services/UserService'
import { PgDb } from 'pogi'
import { sendMailTemplate } from '@orbiting/backend-modules-mail'
import { t } from '@orbiting/backend-modules-translate'
import { getConfig } from '../../config'
import { UpgradeService } from '../../services/UpgradeService'
import { Logger } from '@orbiting/backend-modules-types'

const { PROJECT_R_DONATION_PRODUCT_ID } = getConfig()

class CheckoutProcessingError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'CheckoutProcessingError'
  }
}

export async function processCheckoutCompleted(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.CheckoutSessionCompletedEvent,
) {
  switch (event.data.object.mode) {
    case 'setup': {
      return new SetupWorkflow(
        new CustomerInfoService(ctx.pgdb),
        new UpgradeService(ctx.pgdb, ctx.logger),
        ctx.logger.child(
          { eventId: event.id },
          { msgPrefix: '[Checkout SetupWorkflow]' },
        ),
      ).run(company, event)
    }
    case 'subscription': {
      return new SubscriptionCheckoutCompletedWorkflow(
        new PaymentService(),
        new CustomerInfoService(ctx.pgdb),
        new SubscriptionService(ctx.pgdb),
        new InvoiceService(ctx.pgdb),
        Queue.getInstance(),
        ctx.logger.child(
          { eventId: event.id },
          { msgPrefix: '[Checkout SubscriptionWorkflow]' },
        ),
      ).run(company, event)
    }
    case 'payment': {
      return new OneTimePaymentCheckoutCompletedWorkflow(
        new PaymentService(),
        new GiftShop(ctx.pgdb, ctx.logger),
        new UserService(ctx.pgdb),
        new CustomerInfoService(ctx.pgdb),
        new InvoiceService(ctx.pgdb),
        {
          gift: new GiftCodeNotifier(ctx.pgdb),
          donation: new DonateNotifier(ctx.pgdb),
        },
      ).run(company, event)
    }
  }
}

class SubscriptionCheckoutCompletedWorkflow
  implements PaymentWorkflow<Stripe.CheckoutSessionCompletedEvent>
{
  constructor(
    protected readonly paymentService: PaymentService,
    protected readonly customerInfoService: CustomerInfoService,
    protected readonly subscriptionService: SubscriptionService,
    protected readonly invoiceService: InvoiceService,
    protected readonly queue: Queue,
    protected readonly logger: Logger,
  ) {}

  async run(
    company: Company,
    event: Stripe.CheckoutSessionCompletedEvent,
  ): Promise<any> {
    const customerId = this.extractCustomerId(event)
    const userId = await this.resolveUserId(company, customerId)
    const paymentStatus = this.normalizePaymentStatus(event)

    const [subId, invoiceId] = await Promise.all([
      await this.processSubscription(event, company, userId),
      await this.processInvoice(event, company, userId),
    ])

    const order = await this.saveOrder(
      userId,
      company,
      event,
      invoiceId,
      subId,
      paymentStatus,
    )

    await this.processLineItems(event, company, order)
    await this.runNotifiers(event, invoiceId, userId)
    return
  }

  private async processLineItems(
    event: Stripe.CheckoutSessionCompletedEvent,
    company: Company,
    order: Order,
  ) {
    const sess = await this.paymentService.getCheckoutSession(
      company,
      event.data.object.id,
    )

    if (!sess) {
      throw new CheckoutProcessingError('checkout session does not exist')
    }

    const lineItems = sess.line_items?.data.map((line) => {
      return {
        lineItemId: line.id,
        externalPriceId: line.price!.id,
        priceLookupKey: line.price!.lookup_key,
        description: line.description,
        quantity: line.quantity,
        price: line.amount_total,
        priceSubtotal: line.amount_subtotal,
        taxAmount: line.amount_tax,
        discountAmount: line.amount_discount,
      }
    })

    const orderLineItems = lineItems?.map((i) => {
      return { orderId: order.id, ...i }
    })

    if (orderLineItems?.length) {
      await this.invoiceService.saveOrderItems(orderLineItems)
    }
  }

  private async saveOrder(
    userId: string,
    company: Company,
    event: Stripe.CheckoutSessionCompletedEvent,
    invoiceId: string | undefined,
    subId: string | undefined,
    paymentStatus: string,
  ) {
    return await this.invoiceService.saveOrder({
      userId: userId,
      company: company,
      externalId: event.data.object.id,
      invoiceId: invoiceId,
      subscriptionId: subId,
      status: paymentStatus as 'paid' | 'unpaid',
    })
  }

  private async processInvoice(
    event: Stripe.CheckoutSessionCompletedEvent,
    company: Company,
    userId: string,
  ) {
    const extInvoiceId = event.data.object.invoice
    if (typeof extInvoiceId === 'string') {
      const existingInvoice = await this.invoiceService.getInvoice({
        externalId: extInvoiceId,
      })
      if (existingInvoice) {
        return existingInvoice.id
      }
    }

    // if checkout contains a invoice that is not in the database try to save it
    const stripeInvoice = await this.paymentService.getInvoice(
      company,
      extInvoiceId as string,
    )
    if (!stripeInvoice) {
      this.logger.warn(`Invoice not found in Stripe`, {
        externalId: extInvoiceId,
      })
      return undefined
    }
    const args = mapInvoiceArgs(company, stripeInvoice)
    const saved = await this.invoiceService.saveInvoice(userId, args)

    // await this.trackCharges(invoiceData, company)
    return saved.id
  }

  // private async trackCharges(
  //   invoiceData: Stripe.Response<Stripe.Invoice>,
  //   company: string,
  // ) {
  // TODO!: FIX charge tracking for stripe api 2025-08-27.basil
  // const invoiceCharge = invoiceData.payments?.data[0].payment
  //   .charge as Stripe.Charge
  // const chargeArgs = mapChargeArgs(
  //   company,
  //   invoiceId,
  //   invoiceCharge as Stripe.Charge,
  // )
  // try {
  //   await this.invoiceService.saveCharge(chargeArgs)
  // } catch (e) {
  //   if (e instanceof Error) {
  //     console.log(`Error recording charge: ${e.message}`)
  //   }
  // }
  // }

  private async processSubscription(
    event: Stripe.CheckoutSessionCompletedEvent,
    company: Company,
    userId: string,
  ) {
    const externalSubId = event.data.object.subscription
    if (typeof externalSubId !== 'string') {
      return undefined
    }

    const existingSubscription = await this.subscriptionService.getSubscription(
      {
        externalId: externalSubId,
      },
    )
    if (existingSubscription) {
      return existingSubscription.id
    }

    const subscription = await this.paymentService.getSubscription(
      company,
      externalSubId,
    )
    if (!subscription) {
      this.logger.warn(`Subscription not found in Stripe`, {
        externalId: externalSubId,
      })
      return undefined
    }

    const args = mapSubscriptionArgs(company, subscription)
    const created = await this.subscriptionService.setupSubscription(
      userId,
      args,
    )
    return created.id
  }

  private normalizePaymentStatus(event: Stripe.CheckoutSessionCompletedEvent) {
    let paymentStatus = event.data.object.payment_status
    if (paymentStatus === 'no_payment_required') {
      // no payments required are treated as paid
      paymentStatus = 'paid'
    }
    return paymentStatus
  }

  private async resolveUserId(company: Company, customerId: string) {
    const userId = await this.customerInfoService.getUserIdForCompanyCustomer(
      company,
      customerId,
    )
    if (!userId) {
      throw Error(`User for ${customerId} does not exists`)
    }
    return userId
  }

  private extractCustomerId(event: Stripe.CheckoutSessionCompletedEvent) {
    const customerId = event.data.object.customer?.toString()
    if (!customerId) {
      throw new CheckoutProcessingError('No stripe customer')
    }
    return customerId
  }

  private async runNotifiers(
    event: Stripe.CheckoutSessionCompletedEvent,
    invoiceId: string | undefined,
    userId: string,
  ) {
    await Promise.all([
      this.queue.send<ConfirmSetupTransactionalWorker>(
        'payments:transactional:confirm:setup',
        {
          $version: 'v1',
          eventSourceId: event.id,
          invoiceId: invoiceId as string,
          userId: userId,
        },
      ),
      this.queue.send<SyncMailchimpSetupWorker>(
        'payments:mailchimp:sync:setup',
        {
          $version: 'v1',
          eventSourceId: event.id,
          userId: userId,
        },
      ),
    ])
  }
}

class OneTimePaymentCheckoutCompletedWorkflow
  implements PaymentWorkflow<Stripe.CheckoutSessionCompletedEvent>
{
  constructor(
    protected readonly paymentService: PaymentService,
    protected readonly giftShop: GiftShop,
    protected readonly userService: UserService,
    protected readonly customerInfoService: CustomerInfoService,
    protected readonly invoiceService: InvoiceService,
    protected readonly notifiers: Record<
      'donation' | 'gift',
      MailNotifier<any>
    >,
  ) {}

  async run(
    company: Company,
    event: Stripe.CheckoutSessionCompletedEvent,
  ): Promise<any> {
    const sess = await this.getLatestSessionFromStripe(company, event)
    const userId = await this.getUserForCheckoutSession(sess, company)
    const paymentStatus = this.normalizePaymentStatus(event)
    const addressId = await this.saveAddress(sess)

    const order = await this.saveOrder(
      userId,
      sess,
      company,
      event,
      paymentStatus,
      addressId,
    )

    const lineItems = await this.saveLineItems(sess, order)

    await this.runNotifiers(sess, lineItems, company, order)
  }

  private async runNotifiers(
    sess: Stripe.Response<Stripe.Checkout.Session>,
    lineItems: {
      lineItemId: string
      externalPriceId: string
      priceLookupKey: string | null
      description: string | null
      quantity: number | null
      price: number
      priceSubtotal: number
      taxAmount: number
      discountAmount: number
    }[],
    company: Company,
    order: Order,
  ) {
    const donation = sess.line_items!.data.find((i) => {
      return (
        (typeof i.price?.product === 'object' &&
          i.price?.product.id === PROJECT_R_DONATION_PRODUCT_ID) ||
        (typeof i.price?.product === 'string' &&
          i.price?.product === PROJECT_R_DONATION_PRODUCT_ID)
      )
    })

    if (donation && sess.customer_details?.email) {
      await this.runDonationNotifier(sess, donation)
    }

    const giftCodes = []
    for (const item of lineItems) {
      if (item.priceLookupKey?.startsWith('GIFT')) {
        const code = await this.giftShop.generateNewVoucher({
          company: company,
          orderId: order.id,
          giftId: item.priceLookupKey,
        })
        giftCodes.push(code)
      }
    }

    if (giftCodes.length && sess.customer_details?.email) {
      await this.runGiftNotifiers(sess, giftCodes)
    }
  }

  private async runGiftNotifiers(
    sess: Stripe.Response<Stripe.Checkout.Session>,
    giftCodes: Voucher[],
  ) {
    if (this.notifiers['gift']) {
      await this.notifiers['gift'].sendEmail(
        sess.customer_details!.email!,
        giftCodes[0],
      )
    } else {
      console.log(`
        No mailer configured

        Thanks for the gift purchase

        to: ${sess.customer_details!.email!}
        gift-code: ${giftCodes[0]}
        `)
    }
  }

  private async runDonationNotifier(
    sess: Stripe.Response<Stripe.Checkout.Session>,
    donation: Stripe.LineItem,
  ) {
    if (this.notifiers['donation']) {
      await this.notifiers['donation'].sendEmail(
        sess.customer_details!.email!,
        {
          total_amount: donation.amount_total,
        },
      )
    } else {
      console.log(`
          No mailer configured

          Thanks for the donation

          to: ${sess.customer_details!.email!}
          dontaion-total: ${donation.amount_total}
        `)
    }
  }

  private async saveOrder(
    userId: string | undefined,
    sess: Stripe.Response<Stripe.Checkout.Session>,
    company: Company,
    event: Stripe.CheckoutSessionCompletedEvent,
    paymentStatus: string,
    addressId: string | undefined,
  ) {
    const orderDraft = {
      userId: userId,
      customerEmail:
        typeof userId === 'undefined'
          ? sess.customer_details!.email!
          : undefined,
      company: company,
      metadata: sess.metadata,
      externalId: event.data.object.id,
      status: paymentStatus as 'paid' | 'unpaid',
      shippingAddressId: addressId,
      paymentIntentId: sess.payment_intent,
    }

    const order = await this.invoiceService.saveOrder(orderDraft)
    return order
  }

  private async saveAddress(sess: Stripe.Response<Stripe.Checkout.Session>) {
    let addressId: string | undefined = undefined
    if (sess.collected_information?.shipping_details) {
      const shipping_details = sess.collected_information?.shipping_details
      const data = {
        name: shipping_details.name!,
        city: shipping_details.address.city,
        line1: shipping_details.address.line1,
        line2: shipping_details.address.line2,
        postalCode: shipping_details.address.postal_code,
        country: new Intl.DisplayNames(['de-CH'], { type: 'region' }).of(
          shipping_details.address.country!,
        ),
      }
      addressId = (await this.userService.insertAddress(data)).id
    }
    return addressId
  }

  private async saveLineItems(
    sess: Stripe.Response<Stripe.Checkout.Session>,
    order: Order,
  ) {
    const lineItems = sess.line_items!.data.map((line) => {
      return {
        lineItemId: line.id,
        externalPriceId: line.price!.id,
        priceLookupKey: line.price!.lookup_key,
        description: line.description,
        quantity: line.quantity,
        price: line.amount_total,
        priceSubtotal: line.amount_subtotal,
        taxAmount: line.amount_tax,
        discountAmount: line.amount_discount,
      }
    })

    const orderLineItems = lineItems.map((i) => {
      return { orderId: order.id, ...i, description: i.description ?? null }
    })

    await this.invoiceService.saveOrderItems(orderLineItems)
    return lineItems
  }

  private normalizePaymentStatus(event: Stripe.CheckoutSessionCompletedEvent) {
    let paymentStatus = event.data.object.payment_status
    if (paymentStatus === 'no_payment_required') {
      // no payments required are treated as paid
      paymentStatus = 'paid'
    }
    return paymentStatus
  }

  private async getUserForCheckoutSession(
    sess: Stripe.Response<Stripe.Checkout.Session>,
    company: Company,
  ) {
    let userId = undefined
    if (typeof sess.customer !== 'undefined') {
      userId =
        (await this.customerInfoService.getUserIdForCompanyCustomer(
          company,
          sess.customer as string,
        )) ?? undefined
    }
    return userId
  }

  private async getLatestSessionFromStripe(
    company: Company,
    event: Stripe.CheckoutSessionCompletedEvent,
  ) {
    const sess = await this.paymentService.getCheckoutSession(
      company,
      event.data.object.id,
    )
    if (!sess) {
      throw new CheckoutProcessingError('checkout session does not exist')
    }

    if (!sess.line_items) {
      throw new CheckoutProcessingError('checkout session has no line items')
    }
    return sess
  }
}

class GiftCodeNotifier implements MailNotifier<{ code: string }> {
  constructor(protected readonly pgdb: PgDb) {}

  async sendEmail(email: string, args: { code: string }) {
    return sendGiftPurchaseMail(
      {
        email: email,
        voucherCode: args.code.replace(/(\w{4})(\w{4})/, '$1-$2'),
      },
      this.pgdb,
    )
  }
}

class DonateNotifier implements MailNotifier<{ total_amount: number }> {
  readonly templateName = 'payment_successful_donate'

  constructor(protected readonly pgdb: PgDb) {}

  async sendEmail(email: string, args: { total_amount: number }) {
    const globalMergeVars = [
      {
        name: 'total_formatted',
        content: (args.total_amount / 100).toFixed(2),
      },
    ]

    const sendMailResult = await sendMailTemplate(
      {
        to: email,
        fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS as string,
        subject: t(`api/email/${this.templateName}/subject`),
        templateName: this.templateName,
        mergeLanguage: 'handlebars',
        globalMergeVars,
      },
      { pgdb: this.pgdb },
    )

    return sendMailResult
  }
}

class SetupWorkflow
  implements PaymentWorkflow<Stripe.CheckoutSessionCompletedEvent>
{
  // private paymentService: PaymentService
  // private customerInfoService: CustomerInfoService
  // private subscriptionService: SubscriptionService
  private upgradeService: UpgradeService
  // private invoiceService: InvoiceService
  private logger: Logger

  constructor(
    _customerInfoService: CustomerInfoService,
    upgradeService: UpgradeService,
    logger: Logger,
  ) {
    // this.customerInfoService = customerInfoService
    this.upgradeService = upgradeService
    this.logger = logger
  }
  async run(
    company: Company,
    event: Stripe.CheckoutSessionCompletedEvent,
  ): Promise<any> {
    this.logger.debug({ company, eventMeta: event.id }, 'Event received')

    try {
      const upgradeRef = this.getUpgradeRef(event.data.object.metadata)

      if (!upgradeRef || !upgradeRef.upgradeId) {
        throw new Error('Upgrade ref missing')
      }

      const res = await this.upgradeService.nonInteractiveSubscriptionUpgrade(
        upgradeRef?.upgradeId,
      )

      this.logger.debug(res, 'upgrade scheduled')
    } catch (e) {
      this.logger.debug(
        { error: e },
        'error handling subscription upgrade order',
      )
      throw e
    }

    return
  }

  private getUpgradeRef(metadata: Stripe.Metadata | null): {
    upgradeId: string
  } | null {
    if (!metadata) return null

    return { upgradeId: metadata['republik:upgrade:ref'] }
  }
}
