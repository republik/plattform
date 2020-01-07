const fetch = require('isomorphic-unfetch')
const { NewsletterMemberMailError } = require('./errors')

const {
  MANDRILL_API_KEY
} = process.env

const MandrillInterface = ({ logger }) => {
  return {
    buildApiUrl (path) {
      return `https://mandrillapp.com/api/1.0${path}`
    },
    async fetchAuthenticated (method, url, request = {}) {
      return fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: MANDRILL_API_KEY,
          ...request
        })
      })
    },
    isUsable () {
      return !!(MANDRILL_API_KEY && MANDRILL_API_KEY.length)
    },
    async send (message, templateName, templateContent) {
      const url = this.buildApiUrl(
        templateName
          ? '/messages/send-template.json'
          : '/messages/send.json')
      try {
        const body = { message }
        if (templateName) {
          body.template_name = templateName
          body.template_content = templateContent
        }
        const response = await this.fetchAuthenticated('POST', url, body)
        const json = await response.json()
        return json
      } catch (error) {
        logger.error(`mandrill -> exception: ${error.message}`)
        throw new NewsletterMemberMailError({ error, message })
      }
    }
  }
}

module.exports = MandrillInterface
