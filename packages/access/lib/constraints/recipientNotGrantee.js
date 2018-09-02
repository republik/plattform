const debug = require('debug')('access:lib:constraints:recipientNotGrantee')

const isGrantable = async (args, context) => {
  const { email, grantee } = args

  const isNotEqual =
    email.trim().toLowerCase() !== grantee.email.trim().toLowerCase()

  debug({
    grantee: grantee.id,
    email,
    isNotEqual
  })

  return isNotEqual
}

const getMeta = () => ({
  visible: true,
  grantable: null, // unkown if it is grantable
  payload: {}
})

module.exports = {
  isGrantable,
  getMeta
}
