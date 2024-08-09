import { Subscription } from '../types'

export interface PaymentGatwayActions {
  getCustomerSubscriptions(customerId: string): Promise<Subscription[]>
  createCustomer(email: string, userId: string): Promise<string>
  verifyWebhook<T>(req: any, secret: string): T
}
