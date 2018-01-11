const { get } = require('../../../lib/Redirections')

module.exports = async (
  _,
  { path },
  context
) => {
  const result = await get(path, null, context)
  return result[0]
}
