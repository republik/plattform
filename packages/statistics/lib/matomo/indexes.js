const Promise = require('bluebird')
const debug = require('debug')('statistics:lib:matomo:index')

const get = async ({ year, segment = null, idSite, period, groupBy = 'url' }, { pgdb }) => {
  const condition = {
    date: year.format('YYYY'),
    segment,
    idSite,
    period,
    groupBy
  }

  debug('get() %o', condition)

  const index = await pgdb.public.statisticsIndexes.findOne({
    type: 'matomo',
    condition: {
      date: year.format('YYYY'),
      segment,
      idSite,
      period,
      groupBy
    }
  })

  return index && index.data
}

const compute = ({ data, index, percentile }) => {
  debug('compute() %o', { percentile, data })

  const percentiles = {}

  Object.keys(data).map(key => {
    if (index && index[`${key}.${percentile}`]) {
      percentiles[key] = (1 / index[`${key}.${percentile}`] * data[key])
    }
  })

  return { ...percentiles }
}

module.exports = ({ props, idSite, period }, { pgdb }) => ({
  pluck:
    async (rows) => {
      const propsWithIndex = await Promise.map(props, async prop => {
        const { indexYear, segment } = prop
        const index = await get({ year: indexYear, segment, idSite, period }, { pgdb })
        return { ...prop, index }
      })

      return Promise.map(
        rows,
        async row => {
          const pluckedRow = { ...row }

          propsWithIndex.forEach(({ prop, index, percentile }) => {
            const data = pluckedRow[prop]
            pluckedRow[prop][percentile] = compute({ data, index, percentile })
          })

          return pluckedRow
        }
      )
    }
})

module.exports.get = get
