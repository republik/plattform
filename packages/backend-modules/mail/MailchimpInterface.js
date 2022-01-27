const fetch = require('isomorphic-unfetch')
const checkEnv = require('check-env')
const crypto = require('crypto')
const debug = require('debug')('mail:MailchimpInterface')
const { omitBy, isNil } = require('lodash')

const base64u = require('@orbiting/backend-modules-base64u')

const { NewsletterMemberMailError } = require('./errors')

const { MAILCHIMP_API_KEY, MAILCHIMP_URL, MAILCHIMP_MAIN_LIST_ID } = process.env

const MINIMUM_HTTP_RESPONSE_STATUS_ERROR = 400

const MailchimpInterface = ({ logger }) => {
  checkEnv(['MAILCHIMP_API_KEY', 'MAILCHIMP_URL', 'MAILCHIMP_MAIN_LIST_ID'])
  return {
    buildApiUrl(path) {
      return `${MAILCHIMP_URL}/3.0/lists/${MAILCHIMP_MAIN_LIST_ID}${path}`
    },
    buildMembersApiUrl(email) {
      const hash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex')

      return this.buildApiUrl(`/members/${hash}`)
    },
    buildBatchesApiUrl(id) {
      // returns {MAILCHIMP_URL}/3.0/batches[/{id}]
      return [
        `${MAILCHIMP_URL}/3.0/batches`,
        id && `/${id}`, // optional /{id} part
      ]
        .filter(Boolean)
        .join('')
    },
    async fetchAuthenticated(method, url, request = {}) {
      debug(`${method} ${url}`)
      const options = {
        method,
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from('anystring:' + MAILCHIMP_API_KEY).toString('base64'),
        },
        ...request,
      }
      return fetch(url, options)
    },
    async getMember(email) {
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
    async updateMember(email, data) {
      const url = this.buildMembersApiUrl(email)
      try {
        // Build PUT request, and drop props where value is null or undefined to avoid
        // malformatted error responses from API.
        const body = {
          ...data,
          ...(data.interests && { interests: omitBy(data.interests, isNil) }),
          merge_fields: {
            ...(data.merge_fields && omitBy(data.merge_fields, isNil)),
            EMAILB64U: base64u.encode(email),
          },
        }
        debug('MailchimpInterface.updateMember PUT', { body })
        const response = await this.fetchAuthenticated('PUT', url, {
          body: JSON.stringify(body),
        })
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
    /* 
    MailChimp differs between archiving and permanently deleting members
    For further reference see API docs: 
      - archiving: https://mailchimp.com/developer/marketing/api/list-members/archive-list-member/
      - deleting: https://mailchimp.com/developer/marketing/api/list-members/delete-list-member/
    And more information about the differences of unsubscribe, archive and delete:
    https://www.chimpanswers.com/cleaning-your-mailchimp-audience/
    */
    async archiveMember(email) {
      debug(`archiving ${email}`)
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
    },
    async deleteMember(email) {
      debug(`deleting ${email}`)
      const url = this.buildMembersApiUrl(email) + '/actions/delete-permanent'
      try {
        const response = await this.fetchAuthenticated('POST', url)
        if (response.status >= MINIMUM_HTTP_RESPONSE_STATUS_ERROR) {
          debug(`could not delete member: ${email}`)
          return null
        }
        return true
      } catch (error) {
        logger.error(`mailchimp -> exception: ${error.message}`)
        throw new NewsletterMemberMailError({ error, email })
      }
    },
    async postBatch(operations) {
      const preparedOperations = operations.map((operation) => {
        const { subscriberHash, ...rest } = operation

        return {
          ...rest,

          // stringify body if not a sstring just yet
          ...(typeof operation.body !== 'string' && {
            body: JSON.stringify(operation.body),
          }),

          // when subscriber hash is provided, overwrite path to member resource
          ...(subscriberHash && {
            path: `/lists/${MAILCHIMP_MAIN_LIST_ID}/members/${subscriberHash}`,
          }),
        }
      })

      return this.fetchAuthenticated('POST', this.buildBatchesApiUrl(), {
        body: JSON.stringify({ operations: preparedOperations }),
      })
    },
    async getBatch(id) {
      return this.fetchAuthenticated('GET', this.buildBatchesApiUrl(id))
    },
  }
}

MailchimpInterface.MemberStatus = {
  Subscribed: 'subscribed',
  Pending: 'pending',
  Unsubscribed: 'unsubscribed',
}

module.exports = MailchimpInterface
