const intersect = (arr1, arr2) => [...new Set(arr1)].filter(num => new Set(arr2).has(num))

const createNewsletterSubscription = (interestConfigurationMap) => ({
  buildSubscription (userId, interestId, subscribed, roles) {
    const interstConfiguration = this.interestConfiguration(interestId)
    const name = interstConfiguration.name
    const id = Buffer.from(userId + name).toString('base64')
    const isEligible = this.isEligibleForInterestId(interestId, roles)
    return { name, id, subscribed, isEligible }
  },

  allInterestConfigurations () {
    return interestConfigurationMap || []
  },

  interestIdByName (name) {
    return interestConfigurationMap
      .reduce((oldResult, { name: currentName, interestId }) => {
        if (currentName === name) return interestId
        return oldResult
      }, null)
  },

  interestConfiguration (interestId) {
    return interestConfigurationMap
      .filter(({ interestId: currentInterestId }) => currentInterestId === interestId)
      .reduce((last, interest) => interest, {})
  },

  requiredRolesForInterest (interestId) {
    const interest = this.interestConfiguration(interestId)
    return interest.roles || []
  },

  isEligibleForInterestId (interestId, roles) {
    const requiredRoles = this.requiredRolesForInterest(interestId)
    if (requiredRoles.length === 0) return true
    return intersect(requiredRoles, roles).length > 0
  }
})

/* fn is of signature: (data, NewsletterSubscription) => any */
const withConfiguration = (interestConfiguration, fn) => {
  const NewsletterSubscription = createNewsletterSubscription(interestConfiguration)
  return (data) => fn(data, NewsletterSubscription)
}

module.exports = {
  withConfiguration,
  createNewsletterSubscription
}
