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
  firstName: string
  lastName: string
  shippingAddress?: Address
}

export function getPayerInformationFromEvent(
  event: PaymentRequestPaymentMethodEvent,
): PayerInformation {
  const [...firstNames, lastName] = event.payerName.split(' ')

  return {
    email: event.payerEmail,
    firstName: firstNames.join(' ').trim(),
    lastName: lastName.trim(),
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
