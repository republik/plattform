const NewsletterSubscription = require('../NewsletterSubscription')

module.exports = (interestConfiguration) => {
  NewsletterSubscription.configure(interestConfiguration)
}
