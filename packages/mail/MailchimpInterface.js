const fetch = require('isomorphic-unfetch')
const checkEnv = require('check-env')
const crypto = require('crypto')
const { NewsletterMemberMailError } = require('./lib/errors')

const {
  MAILCHIMP_API_KEY,
  MAILCHIMP_URL,
  MAILCHIMP_MAIN_LIST_ID
} = process.env

checkEnv([
  'MAILCHIMP_API_KEY',
  'MAILCHIMP_URL',
  'MAILCHIMP_MAIN_LIST_ID'
])

class MailchimpInterface {
  constructor ({ logger } = {}) {
    this.logger = logger || console
  }

  buildApiUrl (path) {
    return `${MAILCHIMP_URL}/3.0/lists/${MAILCHIMP_MAIN_LIST_ID}${path}`
  }

  buildMembersApiUrl (email) {
    const hash = crypto
      .createHash('md5')
      .update(email)
      .digest('hex')
      .toLowerCase()

    return this.buildApiUrl(`/members/${hash}`)
  }

  async fetchAuthenticated (method, url, request = {}) {
    this.logger.log(`mailchimp -> ${method} ${url}`)
    const options = {
      method,
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from('anystring:' + MAILCHIMP_API_KEY).toString(
            'base64'
          )
      },
      ...request
    }
    return fetch(url, options)
  }

  async getMember (email) {
    const url = this.buildMembersApiUrl(email)
    try {
      const response = await this.fetchAuthenticated('GET', url)
      const json = await response.json()
      if (response.status >= 400) {
        this.logger.error(`mailchimp -> could not get member: ${email} ${json.detail}`)
        return null
      }
      return json
    } catch (error) {
      this.logger.error(`mailchimp -> exception: ${error.message}`)
      throw new NewsletterMemberMailError({ error, email })
    }
  }

  async updateMember (email, data) {
    const url = this.buildMembersApiUrl(email)
    try {
      const request = { body: JSON.stringify(data) }
      const response = await this.fetchAuthenticated('PUT', url, request)
      const json = await response.json()
      if (response.status >= 400) {
        this.logger.error(`mailchimp -> could not update member: ${email} ${json.detail}`)
        return null
      }
      return json
    } catch (error) {
      this.logger.error(`mailchimp -> exception: ${error.message}`)
      throw new NewsletterMemberMailError({ error, email })
    }
  }
}

module.exports = MailchimpInterface
