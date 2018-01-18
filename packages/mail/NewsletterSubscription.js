const intersect = (arr1, arr2) => [...new Set(arr1)].filter(num => new Set(arr2).has(num))

const createNewsletterSubscription = (interestConfigurationMap) => class NewsletterSubscription {
  constructor (userId, interestId, subscribed, roles) {
    const interstConfiguration = this.constructor.interestConfiguration(interestId)
    this.name = interstConfiguration.name
    this.id = Buffer.from(userId + this.name).toString('base64')
    this.subscribed = subscribed
    this.isEligible = this.constructor.isEligibleForInterestId(interestId, roles)
  }

  static allInterestConfigurations () {
    return interestConfigurationMap || []
  }

  static interestIdByName (name) {
    return interestConfigurationMap
      .reduce((oldResult, { name: currentName, interestId }) => {
        if (currentName === name) return interestId
        return oldResult
      }, null)
  }

  static interestConfiguration (interestId) {
    return interestConfigurationMap
      .filter(({ interestId: currentInterestId }) => currentInterestId === interestId)
      .reduce((last, interest) => interest, {})
  }

  static requiredRolesForInterest (interestId) {
    const interest = this.interestConfiguration(interestId)
    return interest.roles || []
  }

  static isEligibleForInterestId (interestId, roles) {
    const requiredRoles = this.requiredRolesForInterest(interestId)
    if (requiredRoles.length === 0) return true
    return intersect(requiredRoles, roles).length > 0
  }
}

/* fn is of signature: (data, NewsletterSubscription) => any */
const withConfiguration = (interestConfiguration, fn) => {
  const NewsletterSubscription = createNewsletterSubscription(interestConfiguration)
  return (data) => fn(data, NewsletterSubscription)
}

module.exports = {
  withConfiguration,
  createNewsletterSubscription
}
