const debug = require('debug')('statistics:lib:matomo:collect')
const Promise = require('bluebird')

const { find: documentsFind, toPath } = require('../elastic/documents')
const { find: redirectionsFind } = require('../pgdb/redirections')

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
    method: 'Transitions.getTransitionsForAction', // @see https://developer.matomo.org/api-reference/reporting-api#Transitions
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
            label.includes(meta.repoId.slice(0, 69)), // Matomo truncates campaign labels to 70 chars
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
      method: 'Actions.getPageUrls', // @see https://developer.matomo.org/api-reference/reporting-api#Actions
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

        data.push(result)
      },
    },
  )

  return data
}

const enrichData =
  ({ docs }) =>
  (data) =>
    data.map((row) => {
      const path = toPath(row.url)
      const doc = docs.find(
        (doc) => doc.meta.path === path || doc.redirections.includes(path),
      )

      if (!doc)
        return { ...row, repoId: null, template: null, publishDate: null }

      const { path: currentPath, repoId, template, publishDate } = doc.meta
      const url = new URL(currentPath, row.url).toString()

      return { ...row, url, repoId, template, publishDate }
    })

const mergeData = (data) =>
  data.reduce((data, curr) => {
    const index = data.findIndex(
      (row) =>
        (!!row.repoId && row.repoId === curr.repoId) || // merge due to same repoId
        row.url === curr.url, // merge due to same url
    )

    // merge curr into data[index]
    if (index > -1) {
      const mergedData = {
        ...data[index],
        mergeCount: data[index].mergeCount + 1,
      }

      Object.keys(curr)
        .filter((key) => !['idSite', 'mergeCount'].includes(key))
        .forEach((key) => {
          if (mergedData[key] && typeof mergedData[key] === 'number') {
            mergedData[key] += curr[key]
          } else {
            mergedData[key] = curr[key]
          }
        })

      data[index] = mergedData
      return data
    }

    // no merging, append data
    return [...data, curr]
  }, [])

const insertRows = async ({ rows = [], pgdb }) =>
  Promise.map(
    rows,
    async (row) => {
      const condition = {
        idSite: row.idSite,
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
  const docs = await documentsFind(
    {
      props: ['meta.path', 'meta.repoId', 'meta.template', 'meta.publishDate'],
    },
    { elastic },
  )

  debug('redirections')
  const redirections = await redirectionsFind(
    { date, targets: docs.map((doc) => doc.meta.path) },
    { pgdb },
  )

  debug('merge redirections into published docs')
  docs.forEach((doc, index) => {
    docs[index] = {
      ...doc,
      redirections: redirections[doc.meta.path] || [],
    }
  })

  debug('collect %o', { idSite, period, date, segment })
  const rows = await getData(
    { idSite, period, date, segment },
    { matomo, docs },
  )
    .then(enrichData({ docs }))
    .then(mergeData)

  debug('insert rows %o', { idSite, period, date, segment, rows: rows.length })
  await insertRows({ rows, pgdb })

  debug('done with %o', { idSite, period, date, segment, rows: rows.length })
}

module.exports = collect
