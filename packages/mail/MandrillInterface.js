const fetch = require('isomorphic-unfetch')
const checkEnv = require('check-env')
const { NewsletterMemberMailError } = require('./lib/errors')

const {
  MANDRILL_API_KEY
} = process.env

checkEnv([
  'MANDRILL_API_KEY'
])

class MandrillInterface {
  constructor ({ logger } = {}) {
    this.logger = logger || console
  }

  buildApiUrl (path) {
    return `https://mandrillapp.com/api/1.0${path}`
  }

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
  }

  async send (message) {
    const url = this.buildApiUrl('/messages/send.json')
    try {
      const body = { message }
      const response = await this.fetchAuthenticated('POST', url, body)
      const json = await response.json()
      console.log(json)
      return json
    } catch (error) {
      this.logger.error(`mandrill -> exception: ${error.message}`)
      throw new NewsletterMemberMailError({ error, message })
    }
  }

  async sendTemplate (message, templateName, templateContent) {
    const url = this.buildApiUrl('/messages/send-template.json')
    try {
      const body = {
        message,
        template_name: templateName,
        template_content: templateContent
      }
      const response = await this.fetchAuthenticated('POST', url, body)
      const json = await response.json()
      return json
    } catch (error) {
      this.logger.error(`mandrill -> exception: ${error.message}`)
      throw new NewsletterMemberMailError({ error, message })
    }
  }
}

module.exports = MandrillInterface
