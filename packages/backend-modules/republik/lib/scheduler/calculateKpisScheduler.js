const debug = require('debug')('republik:lib:scheduler:calculateKpis')
const { calculateKpis } = require('../calculateKpis')

module.exports = async (dryRun = false) => {
  debug('run calculate KPI script and send result to finance')

  calculateKpis()
}
