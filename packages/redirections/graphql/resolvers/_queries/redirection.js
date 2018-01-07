const { get } = require('../../lib/Redirections')

module.exports = async (
  _,
  { path },
  context
) => {
  return get(path, null, context)
}
