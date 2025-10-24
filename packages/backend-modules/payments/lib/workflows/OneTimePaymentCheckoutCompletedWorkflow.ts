import Stripe from 'stripe'
import { Company, MailNotifier, Order, PaymentWorkflow } from '../types'
import { PaymentService } from '../services/PaymentService'
import { GiftShop, Voucher } from '../shop/gifts'
import { UserService } from '../services/UserService'
import { CustomerInfoService } from '../services/CustomerInfoService'
import { InvoiceService } from '../services/InvoiceService'
import { CheckoutProcessingError } from '../errors'
import { getConfig } from '../config'
import { DonationNotifierArgs } from '../email-notifieres/DontateEmail'
import { GiftCodeNotifierArgs } from '../email-notifieres/GiftEmail'

const { PROJECT_R_DONATION_PRODUCT_ID } = getConfig()

export class OneTimePaymentCheckoutCompletedWorkflow
  implements PaymentWorkflow<Stripe.CheckoutSessionCompletedEvent>
{
  constructor(
    protected readonly paymentService: PaymentService,
    protected readonly giftShop: GiftShop,
    protected readonly userService: UserService,
    protected readonly customerInfoService: CustomerInfoService,
    protected readonly invoiceService: InvoiceService,
    protected readonly notifiers: {
      donation?: MailNotifier<DonationNotifierArgs>
      gift?: MailNotifier<GiftCodeNotifierArgs>
    },
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
