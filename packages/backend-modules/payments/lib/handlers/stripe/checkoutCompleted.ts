import Stripe from 'stripe'
import { Company, MailNotifier, PaymentWorkflow } from '../../types'
import { ConfirmSetupTransactionalWorker } from '../../workers/ConfirmSetupTransactionalWorker'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { SyncMailchimpSetupWorker } from '../../workers/SyncMailchimpSetupWorker'
import { mapSubscriptionArgs } from './subscriptionCreated'
import { mapInvoiceArgs } from './invoiceCreated'
// import { mapChargeArgs } from './invoicePaymentSucceeded'
import { GiftShop } from '../../shop/gifts'
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
        new PaymentService(),
        new CustomerInfoService(ctx.pgdb),
        new SubscriptionService(ctx.pgdb),
        new UpgradeService(ctx.pgdb, ctx.logger),
        new InvoiceService(ctx.pgdb),
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
  ) {}

  async run(
    company: Company,
    event: Stripe.CheckoutSessionCompletedEvent,
  ): Promise<any> {
    const customerId = event.data.object.customer?.toString()
    if (!customerId) {
      throw new CheckoutProcessingError('No stripe customer')
    }

    const userId = await this.customerInfoService.getUserIdForCompanyCustomer(
      company,
      customerId,
    )
    if (!userId) {
      throw Error(`User for ${customerId} does not exists`)
    }

    let paymentStatus = event.data.object.payment_status
    if (paymentStatus === 'no_payment_required') {
      // no payments required are treated as paid
      paymentStatus = 'paid'
    }

    let subId: string | undefined
    const externalSubId = event.data.object.subscription
    if (typeof externalSubId === 'string') {
      // if checkout contains a subscription that is not in the database try to save it
      const s = await this.subscriptionService.getSubscription({
        externalId: externalSubId,
      })
      if (!s) {
        const subscription = await this.paymentService.getSubscription(
          company,
          externalSubId,
        )
        if (subscription) {
          const args = mapSubscriptionArgs(company, subscription)
          subId = (
            await this.subscriptionService.setupSubscription(userId, args)
          ).id
        }
      } else {
        subId = s.id
      }
    }

    let invoiceId: string | undefined
    const extInvoiceId = event.data.object.invoice
    if (typeof extInvoiceId === 'string') {
      const i = await this.invoiceService.getInvoice({
        externalId: extInvoiceId,
      })
      if (!i) {
        // if checkout contains a invoice that is not in the database try to save it
        const invoiceData = await this.paymentService.getInvoice(
          company,
          extInvoiceId as string,
        )
        if (invoiceData) {
          const args = mapInvoiceArgs(company, invoiceData)
          invoiceId = (await this.invoiceService.saveInvoice(userId, args)).id

          // TODO!: FIX charge tracking
          // const invoiceCharge = invoiceData.payments?.data[0].payment
          // .charge as Stripe.Charge

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
        }
      } else {
        invoiceId = i.id
      }
    }

    const order = await this.invoiceService.saveOrder({
      userId: userId,
      company: company,
      externalId: event.data.object.id,
      invoiceId: invoiceId as string,
      subscriptionId: subId as string,
      status: paymentStatus as 'paid' | 'unpaid',
    })

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

    const queue = Queue.getInstance()

    await Promise.all([
      queue.send<ConfirmSetupTransactionalWorker>(
        'payments:transactional:confirm:setup',
        {
          $version: 'v1',
          eventSourceId: event.id,
          invoiceId: invoiceId as string,
          userId: userId,
        },
      ),
      queue.send<SyncMailchimpSetupWorker>('payments:mailchimp:sync:setup', {
        $version: 'v1',
        eventSourceId: event.id,
        userId: userId,
      }),
    ])
    return
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

    let userId = undefined
    if (typeof sess.customer !== 'undefined') {
      userId =
        (await this.customerInfoService.getUserIdForCompanyCustomer(
          company,
          sess.customer as string,
        )) ?? undefined
    }

    let paymentStatus = event.data.object.payment_status
    if (paymentStatus === 'no_payment_required') {
      // no payments required are treated as paid
      paymentStatus = 'paid'
    }

    const lineItems = sess.line_items.data.map((line) => {
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

    const orderLineItems = lineItems.map((i) => {
      return { orderId: order.id, ...i, description: i.description ?? null }
    })

    await this.invoiceService.saveOrderItems(orderLineItems)

    const donation = sess.line_items.data.find((i) => {
      if (
        typeof i.price?.product === 'object' &&
        i.price?.product.id === PROJECT_R_DONATION_PRODUCT_ID
      ) {
        return i
      } else if (
        typeof i.price?.product === 'string' &&
        i.price?.product === PROJECT_R_DONATION_PRODUCT_ID
      ) {
        return i
      }
      return null
    })

    if (donation && sess.customer_details?.email) {
      if (this.notifiers['donation']) {
        await this.notifiers['donation'].sendEmail(
          sess.customer_details.email,
          {
            total_amount: donation.amount_total,
          },
        )
      } else {
        console.log(`
          No mailer configured

          Thanks for the donation

          to: ${sess.customer_details.email}
          dontaion-total: ${donation.amount_total}
        `)
      }
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
      if (this.notifiers['gift']) {
        await this.notifiers['gift'].sendEmail(
          sess.customer_details.email,
          giftCodes[0],
        )
      } else {
        console.log(`
        No mailer configured

        Thanks for the gift purchase

        to: ${sess.customer_details.email}
        gift-code: ${giftCodes[0]}
        `)
      }
    }
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
    _paymentService: PaymentService,
    _customerInfoService: CustomerInfoService,
    _subscriptionService: SubscriptionService,
    upgradeService: UpgradeService,
    _invoiceService: InvoiceService,
    logger: Logger,
  ) {
    // this.paymentService = paymentService
    // this.customerInfoService = customerInfoService
    // this.subscriptionService = subscriptionService
    this.upgradeService = upgradeService
    // this.invoiceService = invoiceService
    this.logger = logger
  }
  async run(
    company: Company,
    event: Stripe.CheckoutSessionCompletedEvent,
  ): Promise<any> {
    this.logger.debug(
      { company, eventMeta: event.data.object.metadata },
      'Event received',
    )

    const metadata = event.data.object.metadata
    try {
      const upgradeRef = this.getUpgradeRef(metadata)

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
