const createNewsletterSubscription = (interestConfigurationMap) => ({
  buildSubscription(userId, interestId, subscribed) {
    const interestConfiguration = this.interestConfiguration(interestId)
    const name = interestConfiguration.name
    const id = Buffer.from(userId + name).toString('base64')
    return { name, id, subscribed }
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
    return interestConfigurationMap
      .filter(
        ({ interestId: currentInterestId }) => currentInterestId === interestId,
      )
      .reduce((last, interest) => interest, {})
  },
})

/* fn is of signature: (data, NewsletterSubscription) => any */
const withConfiguration = (interestConfiguration, fn) => {
  const NewsletterSubscription = createNewsletterSubscription(
    interestConfiguration,
  )
  return (data) => fn(data, NewsletterSubscription)
}

module.exports = {
  withConfiguration,
  createNewsletterSubscription,
}
