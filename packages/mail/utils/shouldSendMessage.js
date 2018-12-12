const {
  NODE_ENV,
  SEND_MAILS,
  SEND_MAILS_DOMAIN_FILTER,
  SEND_MAILS_REGEX_FILTERS,
  SEND_MAILS_CATCHALL
} = process.env

const DEV = NODE_ENV && NODE_ENV !== 'production'

module.exports = (message) => {
  const toEmail = message.to[0].email

  // don't send in dev, expect SEND_MAILS is true
  // don't send mails if SEND_MAILS is false
  if (SEND_MAILS === 'false' || (DEV && SEND_MAILS !== 'true')) {
    console.log('\n\nSEND_MAIL prevented mail from being sent\n(SEND_MAIL == false or NODE_ENV != production and SEND_MAIL != true):\n', message)
    return false
  }

  if (SEND_MAILS_DOMAIN_FILTER) {
    const domain = toEmail.split('@')[1]
    if (domain !== SEND_MAILS_DOMAIN_FILTER) {
      console.log(`\n\nSEND_MAILS_DOMAIN_FILTER (${SEND_MAILS_DOMAIN_FILTER}) prevented mail from being sent:\n`, message)
      return false
    }
  }

  if (SEND_MAILS_REGEX_FILTERS) {
    const filters = SEND_MAILS_REGEX_FILTERS.split(';').filter(Boolean)

    const hasMatchedFilter = filters.some(filter => {
      const pattern = new RegExp(`${filter}`)
      return pattern.test(toEmail)
    })

    if (!hasMatchedFilter) {
      console.log(`\n\nSEND_MAILS_REGEX_FILTERS prevented mail from being sent:\n`, message)
      return false
    }
  }

  if (SEND_MAILS_CATCHALL) {
    message.to = [{email: SEND_MAILS_CATCHALL, name: toEmail}]
  }

  return true
}
