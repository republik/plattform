const intersect = (arr1, arr2) => [...new Set(arr1)].filter(num => new Set(arr2).has(num))

class NewsletterSubscription {
  constructor (userId, interestId, subscribed, roles) {
    const interstConfiguration = this.constructor.interestConfiguration(interestId)
    this.name = interstConfiguration.name
    this.id = Buffer.from(userId + this.name).toString('base64')
    this.subscribed = subscribed
    this.isEligible = this.constructor.isEligibleForInterestId(interestId, roles)
  }

  static configure (config) {
    this.interestConfigurationMap = config
  }

  static allInterestConfigurations () {
    return this.interestConfigurationMap || []
  }

  static interestIdByName (name) {
    return this.interestConfigurationMap
      .reduce((oldResult, { name: currentName, interestId }) => {
        if (currentName === name) return interestId
        return oldResult
      }, null)
  }

  static interestConfiguration (interestId) {
    return this.interestConfigurationMap
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

module.exports = NewsletterSubscription
