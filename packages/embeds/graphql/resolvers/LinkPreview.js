const { truncate } = require('@orbiting/backend-modules-utils')
const MAX_LENGTH = 300
module.exports = {
  description: ({ description }) => truncate(description, MAX_LENGTH)
}
