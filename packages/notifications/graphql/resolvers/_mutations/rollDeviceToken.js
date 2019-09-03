const upsertDevice = require('./upsertDevice')

module.exports = (_, { newToken }, context) => upsertDevice(_, { token: newToken }, context)
