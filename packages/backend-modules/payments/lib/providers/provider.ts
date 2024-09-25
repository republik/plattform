import { PaymentProviderRecord } from './base'
import { ProjectRStripe, RepublikAGStripe, StripeProvider } from './stripe'

export const PaymentProvider = new PaymentProviderRecord({
  PROJECT_R: new StripeProvider('PROJECT_R', ProjectRStripe),
  REPUBLIK: new StripeProvider('REPUBLIK', RepublikAGStripe),
})
