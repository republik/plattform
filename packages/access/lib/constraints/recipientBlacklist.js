const debug = require('debug')('access:lib:constraints:recipientBlacklist')

const isGrantable = async (args, context) => {
  const { email, settings } = args

  const valid = !settings.emails.includes(email.trim().toLowerCase())

  debug(
    'isGrantable',
    {
      email,
      settings,
      valid
    }
  )

  return valid
}

const getMeta = async (args, context) => ({
  visible: true,
  grantable: null,
  payload: {}
})

module.exports = {
  isGrantable,
  getMeta
}
