import {
  type Company,
  stripeProviders,
} from '@orbiting/backend-modules-payments'

export class StripeInvoiceService {
  #stripeAdapters = stripeProviders

  async getInvoice(company: Company, invoiceId: string) {
    const stripe = this.#stripeAdapters[company]
    const invoice = await stripe?.invoices.retrieve(invoiceId, {
      expand: [
        // 'parent.subscription_details.subscription',
        'lines.data.pricing.price_details.price',
        'lines.data.pricing.price_details.price.product',
        'payments',
        'discounts',
        'total_taxes.tax_rate_details.tax_rate',
      ],
    })
    return invoice
  }

  async getCharge(company: Company, chargeId: string) {
    const stripe = this.#stripeAdapters[company]
    const charge = await stripe?.charges.retrieve(chargeId)
    return charge
  }
}
