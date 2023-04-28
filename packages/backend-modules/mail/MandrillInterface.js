const { SendMailError } = require('./errors')

const { MANDRILL_API_KEY } = process.env

class MandrillApiError extends Error {
  constructor(message, meta) {
    super()
    this.name = 'MandrillApiError'
    this.message = message
    this.meta = meta
  }
}

const maybeToJson = async (res) => {
  try {
    const json = await res.json()
    return json
  } catch (e) {
    // Swallow JSON parse error and return false
    return false
  }
}

const MandrillInterface = () => {
  return {
    buildApiUrl(path) {
      return `https://mandrillapp.com/api/1.0${path}`
    },
    async fetchAuthenticated(method, url, request = {}) {
      return fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: MANDRILL_API_KEY,
          ...request,
        }),
      })
    },
    isUsable() {
      return !!(MANDRILL_API_KEY && MANDRILL_API_KEY.length)
    },
    async send(message, templateName, templateContent) {
      const url = this.buildApiUrl(
        templateName ? '/messages/send-template.json' : '/messages/send.json',
      )
      const body = { message }
      if (templateName) {
        body.template_name = templateName
        body.template_content = templateContent
      }

      try {
        const res = await this.fetchAuthenticated('POST', url, body)

        // Mandrill might respond with HTTP status code 500. If response body is
        // not parseable as JSON, it indicates an actual internal server error.
        const json = await maybeToJson(res)
        if (!json) {
          throw new MandrillApiError('Unable to connect to Mandrill', {
            status: res.status,
            statusText: res.statusText,
          })
        }

        // However, Mandrill will respond with an internal server error, too, if
        // API is unable to fulfill a request due to faulty parameters or lack
        // thereof. It said case, it will provide detailed error description as
        // JSON body.
        if (json.code < 0) {
          throw new MandrillApiError('Mandrill responded with an error', json)
        }

        return json
      } catch (error) {
        throw new SendMailError({ error })
      }
    },
  }
}

module.exports = MandrillInterface
