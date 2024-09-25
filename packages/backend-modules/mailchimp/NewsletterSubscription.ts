export interface NewsletterSubscriptionInterface {
  buildSubscription(
    userId: string,
    interestId: string,
    subscribed: any,
    roles: any,
  ): any
  allInterestConfigurations(): any
  interestIdByName(name: any): any
  interestConfiguration(interestId: any): any
}

const createNewsletterSubscription = (interestConfigurationMap: any) => ({
  buildSubscription(
    userId: string,
    interestId: string,
    subscribed: any,
    roles: any,
  ) {
    const interestConfig = this.interestConfiguration(interestId)
    if (!interestConfig) {
      return
    }
    const { name, ...rest } = interestConfig
    const id = Buffer.from(userId + name).toString('base64')
    return { ...rest, name, id, userId, interestId, subscribed, roles }
  },

  allInterestConfigurations() {
    return interestConfigurationMap || []
  },

  interestIdByName(name: string) {
    return interestConfigurationMap.reduce(
      (
        oldResult: any,
        { name: currentName, interestId }: { name: string; interestId: string },
      ) => {
        if (currentName === name) return interestId
        return oldResult
      },
      null,
    )
  },

  interestConfiguration(interestId: string) {
    const interests = interestConfigurationMap.filter(
      ({ interestId: currentInterestId }: { interestId: string }) =>
        currentInterestId === interestId,
    )
    return interests.length !== 0 ? interests[0] : null
  },
})

/* fn is of signature: (data, NewsletterSubscription) => any */
const withConfiguration = (
  interestConfiguration: any,
  fn: (data: any, n: NewsletterSubscriptionInterface) => any,
) => {
  const NewsletterSubscription = createNewsletterSubscription(
    interestConfiguration,
  )
  return (data: any) => fn(data, NewsletterSubscription)
}

export { withConfiguration, createNewsletterSubscription }
