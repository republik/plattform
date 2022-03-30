import { PaymentRequestPaymentMethodEvent } from '@stripe/stripe-js'

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
  firstName?: string
  lastName?: string
  billingAddress?: Address
  shippingAddress?: Address
}

export function getPayerInformationFromEvent(
  event: PaymentRequestPaymentMethodEvent,
): PayerInformation {
  const name = event.payerName ?? ''
  const [firstName, ...lastNames] = name.trim().split(' ')

  const billingDetails = event.paymentMethod.billing_details

  return {
    email: event.payerEmail,
    firstName: firstName,
    lastName: lastNames.join(' ').trim(),
    billingAddress: billingDetails?.address
      ? {
          name: billingDetails.name ?? '', // required but backend allows empty strings
          line1: billingDetails.address.line1,
          line2: billingDetails.address.line2,
          postalCode: billingDetails.address.postal_code,
          city: billingDetails.address.city,
          country: billingDetails.address.country,
        }
      : undefined,
    shippingAddress: event.shippingAddress
      ? {
          name: event.shippingAddress.recipient,
          line1:
            event.shippingAddress.addressLine.length > 0
              ? event.shippingAddress.addressLine[0]
              : '', // required but backend allows empty strings
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
