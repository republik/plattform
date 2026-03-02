import { NewsletterConfig } from './config'

export interface NewsletterSubscriptionInterface {
  buildSubscription(
    userId: string,
    interestId: string,
    subscribed: boolean,
    roles: string[],
  ):
    | (NewsletterConfig & {
        userId: string
        subscribed: boolean
        roles: string[]
      })
    | null
  allInterestConfigurations(): NewsletterConfig[]
  interestIdByName(name: string): NewsletterConfig | null
  interestConfiguration(interestId: string): NewsletterConfig | null
}

export const createNewsletterSubscription = (
  interestConfigurations: NewsletterConfig[],
): NewsletterSubscriptionInterface => ({
  buildSubscription(userId, interestId, subscribed, roles) {
    const interestConfig = this.interestConfiguration(interestId)
    if (!interestConfig) {
      return null
    }
    const { name, ...rest } = interestConfig
    const id = Buffer.from(userId + name).toString('base64')
    return { ...rest, name, id, userId, subscribed, roles }
  },

  allInterestConfigurations() {
    return interestConfigurations || []
  },

  interestIdByName(name: string) {
    return interestConfigurations.find((config) => config.name === name) ?? null
  },

  interestConfiguration(interestId: string) {
    const interest = interestConfigurations.find(
      (config) => config.interestId === interestId,
    )
    return interest ?? null
  },
})
