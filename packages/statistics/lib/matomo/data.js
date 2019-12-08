const Promise = require('bluebird')
const debug = require('debug')('statistics:lib:matomo:data')
const moment = require('moment')

const retrieve = async ({ url, date, segment, idSite, period }, { pgdb }) => {
  debug('retrieve()', { url, date, segment, idSite, period })

  const fragmentSegment = segment
    ? `AND sm.segment = '${segment}'`
    : 'AND sm.segment IS NULL'

  const rows = await pgdb.query(`
    SELECT
      sm.*

    FROM "statisticsMatomo" sm
    WHERE
      url = '${url}'
      AND sm.date = '${date}'
      ${fragmentSegment}
      AND "idSite" = '${idSite}'
      AND period = '${period}'
      AND template = 'article'

    LIMIT 1
  `)

  if (rows.length !== 1) {
    return {}
  }

  return { ...rows[0] }
}

module.exports = ({ props, idSite, period }, { pgdb }) => ({
  pluck:
    (rows) => Promise.map(
      rows,
      async row => {
        const pluckedRow = { ...row }

        await Promise.each(props, async ({ prop, segment }) => {
          pluckedRow[prop] = await retrieve(
            {
              data: row,
              url: row.url,
              date: moment(row.date).format('YYYY-MM-DD'),
              segment,
              idSite,
              period
            },
            { pgdb }
          )
        })

        return pluckedRow
      }
    )
})
