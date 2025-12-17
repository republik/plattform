const { checkIpAllowlist } = require('../../../lib/checkIpAllowlist')

module.exports = async (_: any, __: any, context: any) => {
  const { clientIp, pgdb, redis } = context
  
  if (!clientIp) {
    return null
  }
  
  const allowlist = await checkIpAllowlist(clientIp, pgdb, redis)
  return allowlist ? { name: allowlist.name } : null
}

