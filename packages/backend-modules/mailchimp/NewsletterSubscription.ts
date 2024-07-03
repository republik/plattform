const createNewsletterSubscription = (interestConfigurationMap) => ({
  buildSubscription(userId, interestId, subscribed, roles) {
    const { name, ...rest } = this.interestConfiguration(interestId)
    const id = Buffer.from(userId + name).toString('base64')
    return { ...rest, name, id, userId, interestId, subscribed, roles }
  },

  allInterestConfigurations() {
    return interestConfigurationMap || []
  },

  interestIdByName(name) {
    return interestConfigurationMap.reduce(
      (oldResult, { name: currentName, interestId }) => {
        if (currentName === name) return interestId
        return oldResult
      },
      null,
    )
  },

  interestConfiguration(interestId) {
    const interests = interestConfigurationMap.filter(
      ({ interestId: currentInterestId }) => currentInterestId === interestId,
    )
    return interests.length !== 0 ? interests[0] : null
  },
})

/* fn is of signature: (data, NewsletterSubscription) => any */
const withConfiguration = (interestConfiguration, fn) => {
  const NewsletterSubscription = createNewsletterSubscription(
    interestConfiguration,
  )
  return (data) => fn(data, NewsletterSubscription)
}

export {
  withConfiguration,
  createNewsletterSubscription,
}
