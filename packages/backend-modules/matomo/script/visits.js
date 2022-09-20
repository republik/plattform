#!/usr/bin/env node

/* eslint-disable camelcase */

require('@orbiting/backend-modules-env').config()

const fs = require('fs')
const path = require('path')
const mysql = require('mysql2')
const { ascending, descending, range, max } = require('d3-array')
const { timeFormat } = require('d3-time-format')
const yargs = require('yargs')
const { v4: uuid } = require('uuid')

const { t } = require('@orbiting/backend-modules-translate')
const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')

const search = require('@orbiting/backend-modules-search/graphql/resolvers/_queries/search')

const loaderBuilders = {
  ...require('@orbiting/backend-modules-discussions/loaders'),
  ...require('@orbiting/backend-modules-documents/loaders'),
}

const {
  isNewsletterReferer,
  normalizeCampagneName,
  normalizeReferrerName,
} = require('../lib/normalize')

const argv = yargs
  .option('fileBaseData', {
    alias: 'fbd',
    boolean: true,
    default: false,
  })
  .option('year', {
    alias: 'y',
  })
  .help()
  .version().argv

const getContext = (payload) => {
  const loaders = {}
  const context = {
    ...payload,
    loaders,
    user: {
      name: 'Analytics-bot',
      email: 'ruggedly@project-r.construction',
      roles: ['editor', 'member'],
    },
  }
  Object.keys(loaderBuilders).forEach((key) => {
    loaders[key] = loaderBuilders[key](context)
  })
  return context
}

// over all time
// node --max-old-space-size=8192 packages/backend-modules/matomo/script/visits.js
// specific year
// node --max-old-space-size=8192 packages/backend-modules/matomo/script/visits.js --year 2021

// load file base data from file system?
// node --max-old-space-size=8192 packages/backend-modules/matomo/script/visits.js --fbd --year 2021
// generating base data
// redirections.json: https://ultradashboard.republik.ch/question/181
// comments.json: https://ultradashboard.republik.ch/question/451
// documents.json: https://api.republik.ch/graphiql/?query=%7B%0A%20%20documents(first%3A%2010000)%20%7B%0A%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20repoId%0A%20%20%20%20%20%20meta%20%7B%0A%20%20%20%20%20%20%20%20path%0A%20%20%20%20%20%20%20%20template%0A%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20emailSubject%0A%20%20%20%20%20%20%20%20publishDate%0A%20%20%20%20%20%20%20%20feed%0A%20%20%20%20%20%20%20%20credits%0A%20%20%20%20%20%20%20%20estimatedReadingMinutes%0A%20%20%20%20%20%20%20%20ownDiscussion%20%7B%0A%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20linkedDiscussion%20%7B%0A%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20series%20%7B%0A%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20format%20%7B%0A%20%20%20%20%20%20%20%20%20%20meta%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A
// covid19nls.json: https://api.republik.ch/graphiql/?query=%7B%0A%20%20documents(first%3A%2010000%2C%20format%3A%20%22republik%2Fformat-covid-19-uhr-newsletter%22)%20%7B%0A%20%20%20%20totalCount%0A%20%20%20%20nodes%20%7B%0A%20%20%20%20%20%20repoId%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D

// https://developer.matomo.org/guides/persistence-and-the-mysql-backend

// const getWeek = timeFormat('%W')
// const getMonth = timeFormat('%m')
const formatDateHour = timeFormat('%Y-%m-%dT%H')
const formatDayHour = timeFormat('%w-%H')

const parseServerTime = (server_time) =>
  new Date(server_time.replace(' ', 'T').replace(/(\.[0-9]+)$/, 'Z'))

const shortReferrerRemap = {
  'Tagi-Newsletter:': 'Verweise',
  Pocket: 'Verweise',
  Kampagne: 'Kampagnen',
}

const topReferrer = ['Facebook', 'Twitter', 'Google', 'Pocket', 'blog.fefe.de']
const socialNetworks = [
  'Facebook',
  'Twitter',
  'Telegram',
  'GitHub',
  'reddit',
  'XING',
  'LinkedIn',
  'Telegram',
  'Vkontakte',
]

const shortDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

const clearLine = () => {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
}

const analyse = async (context) => {
  const { pgdb } = context
  const { MATOMO_MYSQL_URL } = process.env

  const con = mysql.createConnection(
    MATOMO_MYSQL_URL.match(/rds\.amazonaws\.com/)
      ? `${MATOMO_MYSQL_URL}?ssl=Amazon RDS`
      : MATOMO_MYSQL_URL,
  )

  console.log('mysql db', con.config.host, 'via ssl', !!con.config.ssl)

  const connection = con.promise()

  const documents = (
    argv.fileBaseData
      ? require('./data/documents.json').data.documents.nodes.filter(Boolean)
      : await search(
          null,
          {
            first: 10000,
            unrestricted: true,
            filter: {
              type: 'Document',
            },
            sort: {
              key: 'publishedAt',
              direction: 'DESC',
            },
          },
          context,
        ).then((d) => d.nodes.map((n) => n.entity))
  ).filter(
    (doc) =>
      doc.meta.template === 'article' ||
      doc.meta.template === 'editorialNewsletter',
  )
  console.log('documents', documents.length)

  const covid19NLRepoIds = (
    argv.fileBaseData
      ? require('./data/covid19nls.json').data.documents.nodes.filter(Boolean)
      : await search(
          null,
          {
            first: 10000,
            unrestricted: true,
            filter: {
              format: 'republik/format-covid-19-uhr-newsletter',
              type: 'Document',
            },
            sort: {
              key: 'publishedAt',
              direction: 'DESC',
            },
          },
          context,
        ).then((d) => d.nodes.map((n) => n.entity))
  ).map((doc) => doc.repoId)
  console.log('covid19 nls', covid19NLRepoIds.length)

  const redirections = argv.fileBaseData
    ? require('./data/redirections.json')
    : await pgdb.query(
        'SELECT source, target, "createdAt" FROM redirections WHERE "deletedAt" is null',
      )
  console.log('redirections', redirections.length)

  const getCurrentPath = (path) => {
    let currentPath = path
    let redirection = redirections.find((r) => r.source === currentPath)
    while (redirection) {
      currentPath = redirection.target
      const createdAt = new Date(redirection.createdAt)
      redirection = redirections.find(
        (r) =>
          r.source === currentPath &&
          (redirection.source !== r.target ||
            new Date(r.createdAt) > createdAt),
      )
    }
    return currentPath
  }

  const [urlActions] = await connection.query(
    'SELECT idaction, name FROM piwik_log_action WHERE type = 1',
  )

  console.log('url actions', urlActions.length)
  const actionIdToPath = {}
  const actionIdToDocument = urlActions.reduce((agg, d) => {
    if (d.name.startsWith('republik.ch')) {
      const path = getCurrentPath(
        d.name.replace('republik.ch', '').split('?')[0],
      )
      const doc = documents.find((d) => d.meta.path === path)
      if (doc) {
        agg[d.idaction] = doc
      }
      actionIdToPath[d.idaction] = path
    }
    return agg
  }, {})
  console.log('doc actions', Object.keys(actionIdToDocument).length)

  const [emailActions] = await connection.query(
    `SELECT idaction, name FROM piwik_log_action WHERE type = 4 AND name LIKE 'Email: %'`,
  )

  console.log('email actions', emailActions.length)
  const actionIdIsEmail = emailActions.reduce((agg, d) => {
    agg[d.idaction] = d.name
    return agg
  }, {})

  const [eventActions] = await connection.query(
    'SELECT idaction, name FROM piwik_log_action WHERE type = 11',
  )
  const actionIdToEvent = eventActions.reduce((agg, d) => {
    agg[d.idaction] = d.name
    return agg
  }, {})
  console.log('event actions', Object.keys(actionIdToEvent).length)

  const discussionCounts = argv.fileBaseData
    ? require('./data/comments.json')
    : await pgdb.query(`
SELECT "discussionId", COUNT(*)
FROM comments
WHERE "discussionId" NOT IN ('af8b21a5-92f7-4673-b10c-94b198156b60', '51246466-cf5e-422e-b428-dcdc2a6c60ab') -- alte sammeldebatten
GROUP BY "discussionId"
    `)
  const discussionIndex = discussionCounts.reduce((index, d) => {
    index[d.discussionId] = d.count
    return index
  }, {})

  // «visits»
  // SELECT
  //   idvisitor,
  //   idvisit,
  //   referer_type,
  //   referer_url,
  //   referer_name,
  //   visit_total_time,
  //   location_country,
  //   custom_dimension_1, -- role
  //   config_os
  // FROM piwik_log_visit
  // WHERE idsite = 5

  // «page view»
  // SELECT
  //   idvisitor,
  //   idvisit,
  //   server_time,
  //   idaction_url,
  //   idaction_url_ref, -- previous action in the visit
  //   time_spent,
  //   time_spent_ref_action -- time spent doing the previous action
  // FROM piwik_log_link_visit_action
  // WHERE idsite = 5

  // time_spent in JSON_OBJECT
  // 'time_spent', va.time_spent,
  // 'time_spent_ref_action', va.time_spent_ref_action,

  const query = con.query(`
    SELECT
      -- [warning] converting the idvisitor to string leads to lower numbers than in the matomo ui
      -- conv(hex(v.idvisitor), 16, 16) as idvisitor,
      v.idvisitor,
      v.idvisit,
      v.referer_type,
      v.referer_url,
      v.referer_name,
      v.visit_total_time,
      v.location_country as country,
      v.custom_dimension_1 as roles,
      v.config_os as os,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'server_time', va.server_time,
          'idaction_url', va.idaction_url,
          'idaction_url_ref', va.idaction_url_ref,
          'idaction_name', va.idaction_name,
          'idaction_event_action', va.idaction_event_action
        )
      ) as actions
    FROM piwik_log_visit v
    JOIN piwik_log_link_visit_action va ON va.idvisit = v.idvisit
    WHERE v.idsite = 5
      ${
        argv.year
          ? `AND va.server_time BETWEEN '${argv.year}-01-01 01:00:00' and '${
              +argv.year + 1
            }-01-01 01:00:00'`
          : ''
      }
    GROUP BY v.idvisit
  `)

  const stat = {}
  const docStats = new Map()

  const createRecord = () => {
    return {
      visits: new Set(),
      visitors: new Set(),
      emailors: new Set(),
      sharer: new Set(),
      preview: new Set(),
      // hours: new Map(range(24).map(h => [h, 0])),
      // minutesSpent: new Map(),
      days: new Map(range(7).map((d) => [d, 0])),
      hits: 0,
      countries: new Map(),
      referrer: new Map(),
      shortRefDayHour: new Map(),
      topRefDateHour: new Map(),

      // os: new Map()
    }
  }
  const segments = [
    {
      key: 'all',
      test: () => true,
    },
    {
      key: 'member',
      test: (visit) =>
        (visit.roles && visit.roles.includes('member')) ||
        // because it is free
        (visit.referer_name &&
          isNewsletterReferer(visit.referer_name) &&
          !covid19NLRepoIds.includes(visit.referer_name)),
    },
    // {
    //   key: 'mobile',
    //   test: visit => visit.os === 'IOS' || visit.os === 'AND'
    // }
  ]
  const incrementMap = (map, key, count = 1) => {
    map.set(key, (map.get(key) || 0) + count)
  }
  const incrementUniqMap = (map, key, id) => {
    let set = map.get(key)
    if (!set) {
      set = new Set()
      map.set(key, set)
    }
    set.add(id)
  }
  const increment = (
    stat,
    key,
    visit,
    urlAction,
    events = [],
    { isDoc } = {},
  ) => {
    const rec = (stat[key] = stat[key] || createRecord())

    rec.visitors.add(visit.idvisitor)
    if (urlAction.isEmail) {
      rec.emailors.add(visit.idvisitor)
    }
    // we only count everyone once per country
    incrementUniqMap(rec.countries, visit.country, visit.idvisitor)

    // incrementMap(rec.hours, hour)
    // if (urlAction.time_spent) {
    //   const minutesSpent = Math.floor(urlAction.time_spent / 60)
    //   incrementMap(rec.minutesSpent, minutesSpent)
    // }
    rec.hits += 1

    let referrer
    let shortReferrer
    switch (visit.referer_type) {
      case 6:
        referrer = normalizeCampagneName(visit.referer_name, [
          // // Example, we no longer list Covid-19 separately
          // {
          //   name: 'Covid-19-Uhr-Newsletter',
          //   values: covid19NLRepoIds,
          // },
        ])
        shortReferrer = referrer.split(' ')[0]
        break
      case 7:
      case 3:
      case 2:
        referrer = normalizeReferrerName(visit.referer_name)
        shortReferrer =
          visit.referer_type === 7 || socialNetworks.includes(referrer)
            ? 'Soziale Netzwerke'
            : 'Verweise'
        break
      case 1:
        referrer = 'Direkt / Keine Angabe'
        shortReferrer = 'Direkt'
        break
      default:
        referrer = 'Unbekannt'
        shortReferrer = 'Übrige'
        break
    }
    shortReferrer = shortReferrerRemap[shortReferrer] || shortReferrer

    rec.visits.add(visit.idvisit)
    // one could come in with a different referrer each visit
    incrementUniqMap(rec.referrer, referrer, visit.idvisit)

    const day = urlAction.server_time.getDay()
    incrementMap(rec.days, day)
    if (!isDoc) {
      let rtRec = rec.shortRefDayHour.get(shortReferrer)
      if (!rtRec) {
        rtRec = new Map()
        rec.shortRefDayHour.set(shortReferrer, rtRec)
      }
      incrementMap(rtRec, formatDayHour(urlAction.server_time))
    } else {
      const topRef = topReferrer.includes(referrer) ? referrer : shortReferrer
      let rtRec = rec.topRefDateHour.get(topRef)
      if (!rtRec) {
        rtRec = new Map()
        rec.topRefDateHour.set(topRef, rtRec)
      }
      incrementMap(rtRec, formatDateHour(urlAction.server_time))
    }

    events.forEach(({ event }) => {
      if (
        [
          'share',
          'twitter',
          'facebook',
          'mail',
          'whatsapp',
          'copyLink',
        ].includes(event)
      ) {
        rec.sharer.add(visit.idvisitor)
      }
      if (event.includes('preview')) {
        rec.preview.add(visit.idvisitor)
      }
    })
  }
  const recordDoc = (visit, urlAction, events) => {
    const doc = urlAction.doc

    if (!docStats.has(doc)) {
      docStats.set(doc, {})
    }
    const docStat = docStats.get(doc)

    segments.forEach((segment) => {
      if (segment.test(visit)) {
        increment(docStat, segment.key, visit, urlAction, events, {
          isDoc: true,
        })
      }
    })
  }
  const recordUrl = (visit, urlAction) => {
    segments.forEach((segment) => {
      if (segment.test(visit)) {
        // email visitor ids are not persitent and should not be counted
        if (!urlAction.isEmail) {
          increment(stat, segment.key, visit, urlAction)
        }
      }
    })
  }

  let rowsProcessed = 0
  await new Promise((resolve, reject) =>
    query
      .on('result', (visit) => {
        const actions = visit.actions
          .map(
            ({
              server_time,
              idaction_url,
              idaction_url_ref,
              idaction_name,
              idaction_event_action,
            }) => {
              const doc = actionIdToDocument[idaction_url]
              if (doc) {
                // const nextAction = visit.actions.find(a => a.idaction_url_ref === idaction_url)
                return {
                  urlActionId: idaction_url,
                  isEmail:
                    actionIdIsEmail[idaction_name] &&
                    (!doc.meta.title.startsWith('Email: ') ||
                      actionIdIsEmail[idaction_name] ===
                        `Email: ${doc.meta.emailSubject}`),
                  server_time: parseServerTime(server_time),
                  // time_spent: nextAction
                  //   ? nextAction.time_spent_ref_action
                  //   : time_spent,
                  doc,
                }
              }
              if (actionIdToPath[idaction_url]) {
                return {
                  urlActionId: idaction_url,
                  server_time: parseServerTime(server_time),
                }
              }
              const event = actionIdToEvent[idaction_event_action]
              const eventDoc = actionIdToDocument[idaction_url_ref]
              if (event && eventDoc) {
                return {
                  server_time: parseServerTime(server_time),
                  eventDoc,
                  event,
                }
              }
            },
          )
          .filter(Boolean)
          .sort((a, b) => ascending(a.server_time, b.server_time))

        actions.forEach((action, actionIndex) => {
          if (!action.urlActionId) {
            return
          }
          const firstIndex = actions.findIndex(
            (a) => action.urlActionId === a.urlActionId,
          )
          if (firstIndex !== actionIndex) {
            return
          }
          recordUrl(visit, action)
          if (action.doc) {
            recordDoc(
              visit,
              action,
              actions.filter((a) => a.event && a.eventDoc === action.doc),
            )
          }
        })
        if (rowsProcessed) {
          clearLine()
        }
        rowsProcessed += 1
        process.stdout.write(`row ${rowsProcessed}`)
      })
      .on('error', (err) => reject(err))
      .on('end', () => {
        if (rowsProcessed) {
          clearLine()
          console.log('rows', rowsProcessed)
        }
        return resolve()
      }),
  )

  const mapToJs = (map, compare = (a, b) => ascending(a.key, b.key)) =>
    Array.from(map)
      .map((d) => ({ key: d[0], count: d[1] }))
      .sort(compare)
  const mapSetToJs = (
    mapSet,
    compare = (a, b) => descending(a.count, b.count),
  ) =>
    Array.from(mapSet)
      .map((d) => ({ key: d[0], count: d[1].size }))
      .sort(compare)

  const filterTimeMap = (map, { first = 168, threshold = 100 } = {}) => {
    const keyCounts = new Map()
    map.forEach((values) => {
      values.forEach((count, key) => {
        incrementMap(keyCounts, key, count)
      })
    })

    const CONTEXT = 5
    // include context before and after threshold was met
    const getMaxProximateCount = (all, i) =>
      max(all.slice(Math.max(i - CONTEXT, 0), i + 1 + CONTEXT), (d) => d[1])
    const keysToKeep = Array.from(keyCounts)
      .sort((a, b) => ascending(a[0], b[0]))
      .filter(
        ([key, count], i, all) =>
          i < first || getMaxProximateCount(all, i) >= threshold,
      )
      .map(([key]) => key)

    return Array.from(map).map(([key, values]) => {
      return {
        key,
        values: Array.from(values)
          .filter(([key]) => keysToKeep.includes(key))
          .map((d) => ({ key: d[0], count: d[1] })),
      }
    })
  }

  const toJS = (stat, { isDoc } = {}) =>
    Object.keys(stat).reduce((agg, key) => {
      const segment = stat[key]

      const rtKey = isDoc ? 'topRefDateHour' : 'shortRefDayHour'

      agg[key] = {
        segment: key,
        visitors: segment.visitors.size,
        emailors: segment.emailors.size,
        visits: segment.visits.size,
        hits: segment.hits,
        sharer: segment.sharer.size,
        preview: segment.preview.size,
        countries: mapSetToJs(segment.countries),
        referrer: mapSetToJs(segment.referrer),
        [rtKey]: segment[rtKey]
          ? filterTimeMap(segment[rtKey], {
              first: isDoc
                ? 24 * 3 // first three days
                : Infinity,
              threshold: 200,
            })
          : undefined,
        ...(!isDoc && {
          days: mapToJs(segment.days).map((d) => ({
            key: shortDays[d.key],
            count: d.count,
          })),
        }),
        // hours: mapToJs(segment.hours),
        // minutesSpent: mapToJs(segment.minutesSpent)
      }
      if (rtKey) {
      }
      return agg
    }, {})

  console.log('visitors', stat.all.visitors.size)

  const fileName = `${argv.year ? `${argv.year}` : 'all'}-${uuid()}.json`
  console.log('writing', fileName)

  fs.writeFileSync(
    path.join(__dirname, `data/${fileName}`),
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        filter: argv.year,
        segments: segments.map((segment) => segment.key),
        total: toJS(stat),
        docs: Array.from(docStats).map(([{ meta, repoId }, stat]) => ({
          publishDate: meta.publishDate,
          title: meta.title,
          path: meta.path,
          template: meta.template,
          credits: meta.credits?.children
            ?.filter((c) => c.type === 'link')
            .map((c) => {
              return {
                name:
                  c.title || (c.children?.length ? c.children[0].value : c.url),
                url: c.url,
              }
            }),
          estimatedReadingMinutes: meta.estimatedReadingMinutes,
          series: meta.series && meta.series.title,
          format: meta.format && meta.format.meta.title,
          comments:
            (meta.ownDiscussion && discussionIndex[meta.ownDiscussion.id]) ||
            0 +
              (meta.linkedDiscussion &&
                discussionIndex[meta.linkedDiscussion.id]) ||
            0,
          stats: toJS(stat, { isDoc: true }),
        })),
      },
      undefined,
      2,
    ),
  )

  connection.end()
}

ConnectionContext.create('matomo script visits')
  .then(async (connectionContext) => {
    const context = getContext({
      ...connectionContext,
      t,
    })
    await analyse(context)

    return connectionContext
  })
  .then((connectionContext) => ConnectionContext.close(connectionContext))
