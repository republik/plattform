const fetch = require('isomorphic-unfetch')
const checkEnv = require('check-env')
const crypto = require('crypto')
const debug = require('debug')('mail:MailchimpInterface')
const { NewsletterMemberMailError } = require('./errors')

const {
  MAILCHIMP_API_KEY,
  MAILCHIMP_URL,
  MAILCHIMP_MAIN_LIST_ID
} = process.env

const MINIMUM_HTTP_RESPONSE_STATUS_ERROR = 400

const MailchimpInterface = ({ logger }) => {
  checkEnv([
    'MAILCHIMP_API_KEY',
    'MAILCHIMP_URL',
    'MAILCHIMP_MAIN_LIST_ID'
  ])
  return {
    buildApiUrl (path) {
      return `${MAILCHIMP_URL}/3.0/lists/${MAILCHIMP_MAIN_LIST_ID}${path}`
    },
    buildMembersApiUrl (email) {
      const hash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex')

      return this.buildApiUrl(`/members/${hash}`)
    },
    async fetchAuthenticated (method, url, request = {}) {
      debug(`${method} ${url}`)
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
    },
    async getMember (email) {
      const url = this.buildMembersApiUrl(email)
      try {
        const response = await this.fetchAuthenticated('GET', url)
        const json = await response.json()
        if (response.status >= MINIMUM_HTTP_RESPONSE_STATUS_ERROR) {
          debug(`could not get member: ${email} ${json.detail}`)
          return null
        }
        return json
      } catch (error) {
        logger.error(`mailchimp -> exception: ${error.message}`)
        throw new NewsletterMemberMailError({ error, email })
      }
    },
    async updateMember (email, data) {
      const url = this.buildMembersApiUrl(email)
      try {
        const request = { body: JSON.stringify(data) }
        const response = await this.fetchAuthenticated('PUT', url, request)
        const json = await response.json()
        if (response.status >= MINIMUM_HTTP_RESPONSE_STATUS_ERROR) {
          debug(`could not update member: ${email} ${json.detail}`)
          return null
        }
        return json
      } catch (error) {
        logger.error(`mailchimp -> exception: ${error.message}`)
        throw new NewsletterMemberMailError({ error, email })
      }
    },
    async deleteMember (email) {
      const url = this.buildMembersApiUrl(email)
      try {
        const response = await this.fetchAuthenticated('DELETE', url)
        if (response.status >= MINIMUM_HTTP_RESPONSE_STATUS_ERROR) {
          debug(`could not delete member: ${email}`)
          return null
        }
        return true
      } catch (error) {
        logger.error(`mailchimp -> exception: ${error.message}`)
        throw new NewsletterMemberMailError({ error, email })
      }
    }
  }
}

MailchimpInterface.MemberStatus = {
  Subscribed: 'subscribed',
  Pending: 'pending',
  Unsubscribed: 'unsubscribed'
}

module.exports = MailchimpInterface
