const debug = require('debug')('statistics:lib:matomo:collect')
const Promise = require('bluebird')

const { find, toPath } = require('../elastic/documents')

const getPageUrlDetails = async (
  { url },
  { idSite, period, date, segment, matomo } = {},
) => {
  return matomo.api({
    idSite,
    expanded: 1,
    limitBeforeGrouping: 1000,
    period,
    date,
    segment,

    actionName: url,

    // Not to overwrite (1)
    method: 'Transitions.getTransitionsForAction',
    actionType: 'url',
  })
}

const isPageUrlWanted = ({ url, parsedUrl }) => {
  if (parsedUrl) {
    return true
  }

  debug(`Unwanted page URL: "${url}"`)
  return false
}

const addBucket = (buckets, name, number = 0) => {
  if (!buckets[name]) {
    buckets[name] = 0
  }

  buckets[name] += number
}

const transformPageUrlDetails = (
  { pageMetrics, previousPages, referrers },
  { docs },
) => {
  const buckets = {}

  previousPages.forEach(({ referrals }) => {
    addBucket(buckets, 'previousPages.referrals', parseInt(referrals))
  })

  referrers.forEach((referrer) => {
    const { shortName, visits, details = [] } = referrer

    // Matomo will return shortName "Direct Entry" instead of "direct" of there is
    // no visitiational data available.
    // @TODO: Report Bug to https://github.com/matomo-org/matomo
    if (shortName === 'Direct Entry' && visits === 0) {
      return
    }

    addBucket(buckets, `${shortName}.visits`, visits)
    addBucket(buckets, `${shortName}.referrals`)

    // An array with details e.g. Social Media
    details.forEach((detail) => {
      const { label, referrals } = detail

      addBucket(buckets, `${shortName}.referrals`, parseInt(referrals))

      if (
        shortName === 'campaign' &&
        docs.find(
          ({ meta }) =>
            meta.template === 'editorialNewsletter' &&
            meta.repoId === label.trim(),
        )
      ) {
        addBucket(buckets, 'campaign.newsletter.referrals', parseInt(referrals))
      }

      if (
        shortName === 'social' &&
        ['twitter', 'facebook', 'instagram', 'linkedin'].includes(
          label.toLowerCase(),
        )
      ) {
        addBucket(
          buckets,
          `${shortName}.${label.toLowerCase()}.referrals`,
          parseInt(referrals),
        )
      }
    })
  })

  return { ...pageMetrics, ...buckets }
}

const getData = async ({ idSite, period, date, segment }, { matomo, docs }) => {
  const data = []

  await matomo.scroll(
    {
      idSite,
      method: 'Actions.getPageUrls',
      period,
      date,
      segment,
      flat: 1,
      enhanced: 1,
    },
    {
      rowCallback: async (node) => {
        node.parsedUrl = node.url && new URL(node.url)
        if (!isPageUrlWanted(node)) {
          return false
        }

        const details = await getPageUrlDetails(node, {
          idSite,
          period,
          date,
          segment,
          matomo,
        })
        if (!details) {
          return false
        }

        const transformedDetails = await transformPageUrlDetails(details, {
          docs,
        })

        const pageUrl = Object.assign(new URL(node.parsedUrl), {
          search: '',
          hash: '',
        }).toString()

        const result = {
          idSite,
          period,
          date,
          segment,
          url: pageUrl,
          label: node.label,
          nb_visits: parseInt(node.nb_visits || 0),
          nb_uniq_visitors: parseInt(node.nb_uniq_visitors || 0),
          nb_hits: parseInt(node.nb_hits || 0),
          entry_nb_uniq_visitors: parseInt(node.entry_nb_uniq_visitors || 0),
          entry_nb_visits: parseInt(node.entry_nb_visits || 0),
          entry_nb_actions: parseInt(node.entry_nb_actions || 0),
          entry_bounce_count: parseInt(node.entry_bounce_count || 0),
          exit_nb_uniq_visitors: parseInt(node.exit_nb_uniq_visitors || 0),
          exit_nb_visits: parseInt(node.exit_nb_visits || 0),
          mergeCount: 0,
          ...transformedDetails,
        }

        const index = data.findIndex((row) => row.url === pageUrl)

        if (index > -1) {
          const mergedData = {
            ...data[index],
            mergeCount: data[index].mergeCount + 1,
          }

          Object.keys(result)
            .filter((key) => !['idSite', 'mergeCount'].includes(key))
            .forEach((key) => {
              if (mergedData[key] && typeof mergedData[key] === 'number') {
                mergedData[key] += result[key]
              } else {
                mergedData[key] = result[key]
              }
            })

          data[index] = mergedData

          debug(`merged page URL ${node.url} data into ${pageUrl}`)
        } else {
          // New, no merge required.
          data.push(result)
          debug(`added data for page URL ${pageUrl}`)
        }
      },
    },
  )

  return data
}

const enrichData = ({ data }, { docs }) => {
  const limit = 100
  let offset = 0
  let paths = []

  do {
    debug('enrichData', { limit, offset })

    paths = data.slice(offset, offset + limit)

    docs.forEach(({ meta }) => {
      const index = data.findIndex(({ url }) => toPath(url) === meta.path)
      const { repoId, template, publishDate } = meta
      data[index] = { ...data[index], repoId, template, publishDate }
    })

    offset += limit
  } while (paths.length === limit)

  return data
}

const insertRows = async ({ rows = [], pgdb }) =>
  Promise.map(
    rows,
    async (row) => {
      const condition = {
        url: row.url,
        period: row.period,
        date: row.date,
        segment: row.segment ? row.segment : null,
      }
      const hasRow = !!(await pgdb.public.statisticsMatomo.count(condition))
      if (hasRow) {
        await pgdb.public.statisticsMatomo.update(condition, {
          ...row,
          updatedAt: new Date(),
        })
      } else {
        await pgdb.public.statisticsMatomo.insert(row)
      }
    },
    { concurrency: 1 },
  )

const collect = async (
  { idSite, period, date, segment },
  { pgdb, matomo, elastic },
) => {
  debug('published docs (meta)')
  const docs = await find(
    {
      props: ['meta.path', 'meta.repoId', 'meta.template', 'meta.publishDate'],
    },
    { elastic },
  )

  debug('collect %o', { idSite, period, date, segment })
  const data = await getData(
    { idSite, period, date, segment },
    { matomo, docs },
  )

  debug('enrich %o', { idSite, period, date, segment })
  const rows = enrichData({ data }, { docs })

  await insertRows({ rows, pgdb })
  debug('done with %o', { idSite, period, date, segment, rows: rows.length })
}

module.exports = collect
