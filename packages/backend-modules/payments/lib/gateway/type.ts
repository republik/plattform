import { Subscription } from '../types'

export interface PaymentGatwayActions {
  getUserSubscriptions(userId: string): Promise<Subscription[]>
  createCustomer(email: string, userId: string): Promise<string>
  verifyWebhook<T>(req: any): T
}
