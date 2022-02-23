import {
  PaymentRequestPaymentMethodEvent,
  PaymentRequestShippingAddress,
} from '@stripe/stripe-js'

type Address = {
  name: string
  line1: string
  line2?: string
  postalCode: string
  city: string
  country: string
}

type PayerInformation = {
  email: string
  firstName: string
  lastName: string
  billingAddress?: Address
  shippingAddress?: Address
}

export function getPayerInformationFromEvent(
  event: PaymentRequestPaymentMethodEvent,
): PayerInformation {
  const [firstName, lastName] = event.payerName.split(' ').map((s) => s.trim())

  const billingAddress = event.paymentMethod.billing_details.address

  return {
    email: event.payerEmail,
    firstName,
    lastName,
    billingAddress: billingAddress
      ? {
          name: event.payerName,
          line1: billingAddress.line1,
          line2: billingAddress.line2,
          postalCode: billingAddress.postal_code,
          city: billingAddress.city,
          country: billingAddress.country,
        }
      : undefined,
    shippingAddress: event.shippingAddress
      ? {
          name: event.shippingAddress.recipient,
          line1:
            event.shippingAddress.addressLine.length > 0
              ? event.shippingAddress.addressLine[0]
              : '',
          line2:
            event.shippingAddress.addressLine.length > 1
              ? event.shippingAddress.addressLine.slice(1).join(', ')
              : undefined,
          postalCode: event.shippingAddress.postalCode,
          city: event.shippingAddress.city,
          country: event.shippingAddress.country,
        }
      : undefined,
  }
}
