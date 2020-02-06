#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const Promise = require('bluebird')

const { t } = require('@orbiting/backend-modules-translate')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')
const RedisPubSub = require('@orbiting/backend-modules-base/lib/RedisPubSub')
const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const loaderBuilders = {
  ...require('@orbiting/backend-modules-discussions/loaders'),
  ...require('@orbiting/backend-modules-auth/loaders'),
  ...require('@orbiting/backend-modules-subscriptions/loaders'),
  ...require('@orbiting/backend-modules-documents/loaders'),
  ...require('@orbiting/backend-modules-embeds/loaders')
}
const uuid = require('uuid/v4')

const submitComment = require('../../../packages/discussions/graphql/resolvers/_mutations/submitComment')

const comments = [
  {
    username: 'adriennefichter',
    createdAt: '2019-11-25T16:53:00.000Z',
    content: 'crazy shit. https://projekte.sueddeutsche.de/artikel/politik/wie-china-hunderttausende-in-lagern-interniert-e356735/'
  },
  {
    username: 'bvilliger.heilig',
    createdAt: '2019-12-18T19:11:00.000Z',
    content: `Top-Krimi. Die beiden weiteren Teile sind unterdessen erschienen: Affäre Khan: Ein weiterer Kadermann der Credit Suisse observiert
https://www.nzz.ch/amp/wirtschaft/affaere-khan-ein-weiterer-kadermann-der-credit-suisse-wurde-observiert-ld.1528911`
  },
  {
    username: 'patte',
    createdAt: '2019-12-03T14:52:00.000Z',
    content: 'https://www.golem.de/news/soziales-netzwerk-mitglieder-von-wt-social-koennen-journalisten-beauftragen-1912-145311.html'
  },
  {
    username: 'simonschmid',
    createdAt: '2019-12-21T09:09:00.000Z',
    content: 'wow https://www.nytimes.com/interactive/2019/12/19/opinion/location-tracking-cell-phone.html'
  },
  {
    username: 'eblulle',
    createdAt: '2020-01-06T10:02:00.000Z',
    content: `Ich habe am Wochenende diesen Text gelesen und ganz viel Neues gelernt. Journalismus + Extremismus + Faschismus.
https://www.newyorker.com/magazine/2019/12/09/blood-and-soil-in-narendra-modis-india`
  },
  {
    username: 'pae',
    createdAt: '2020-01-12T10:41:00.000Z',
    content: `Hier, das ist ganz toll, falls dus noch nicht gelesen hast: Wegen Werbung, Leser mitmachen und so.
https://www.nzz.ch/schweiz/240-jahre-jubilaeum/gabor-steingart-das-versagen-und-die-zukunft-des-journalismus-ld.1533157`
  },
  {
    username: 'aarezina',
    createdAt: '2020-01-12T12:27:00.000Z',
    content: 'Top Story: https://podcasts.apple.com/ch/podcast/international/id97733195?i=1000462191313'
  },
  {
    username: 'ofuchs',
    createdAt: '2020-01-12T12:29:00.000Z',
    content: 'https://www.spiegel.de/politik/ausland/iran-usa-konflikt-wie-die-schweiz-half-die-krise-zu-entschaerfen-a-e9cf979d-5af8-41e5-968a-dcd91d55ce85'
  },
  {
    username: 'cmoser',
    createdAt: '2020-01-13T08:31:00.000Z',
    content: `Wow!
https://www.nzz.ch/amp/schweiz/klimaaktivisten-wegen-protest-bei-der-credit-suisse-verurteilt-ld.1533574`
  },
  {
    username: 'robeck',
    createdAt: '2020-01-15T13:44:00.000Z',
    content: 'https://www.spiegel.de/politik/ausland/russland-nachrichtenagenturen-melden-ruecktritt-von-regierung-a-53593a58-bc0c-4da3-be84-c67e8d7e12b8'
  },
  {
    username: 'adriennefichter',
    createdAt: '2020-01-16T14:10:00.000Z',
    content: 'https://www.theguardian.com/technology/2020/jan/16/youtube-ads-of-100-top-brands-fund-climate-misinformation-study'
  },
  {
    username: 'bhamilton.irvine',
    createdAt: '2020-01-16T14:50:00.000Z',
    content: 'Spannend. https://www.tagesanzeiger.ch/schweiz/standard/Frauen-erobern-die-Stadt--per-Verkehrsschild/story/14617235'
  },
  {
    username: 'ofuchs',
    createdAt: '2020-01-29T15:47:00.000Z',
    content: 'top-story: https://twitter.com/juliacarriew/status/1222511450930835456?s=19'
  },
  {
    username: 'ofuchs',
    createdAt: '2020-01-29T16:53:00.000Z',
    content: 'https://twitter.com/kriscoratti/status/1222281539100250114?s=09 cc. @elia'
  }
  /* TODO fix slow urls
  {
    username: 'pae',
    createdAt: '2020-01-30T12:17:00.000Z',
    content: `Das Unicode-Konsortium hat gestern 117 neuen Emojis zugelassen.
Darunter ein Fondue Caquelon!
https://blog.emojipedia.org/117-new-emojis-in-final-list-for-2020/
https://unicode.org/emoji/charts-13.0/emoji-released.html#1fad5
https://www.unicode.org/L2/L2018/18328-fondue-emoji.pdf`
  }
  */
]

const createGraphQLContext = (defaultContext) => {
  const loaders = {}
  const context = {
    ...defaultContext,
    t,
    loaders
  }
  Object.keys(loaderBuilders).forEach(key => {
    loaders[key] = loaderBuilders[key](context)
  })
  return context
}

Promise.props({
  pgdb: PgDb.connect(),
  redis: Redis.connect(),
  pubsub: RedisPubSub.connect(),
  elastic: Elasticsearch.connect()
}).then(async (connections) => {
  const { pgdb, redis, pubsub, elastic } = connections
  const context = createGraphQLContext({ pgdb, redis, pubsub, elastic })

  const discussion = await pgdb.public.discussions.findOne({
    repoId: 'republik-dev/discussion-top-stories-test'
  })
  await pgdb.public.comments.delete({ discussionId: discussion.id })
  if (!discussion.isBoard) {
    await pgdb.public.discussions.updateOne(
      { id: discussion.id },
      { isBoard: true }
    )
  }

  await Promise.each(comments, async (comment) => {
    const user = await pgdb.public.users.findOne({ username: comment.username })
    comment.user = user
  })

  await Promise.each(comments, async (comment) => {
    await submitComment(
      null,
      {
        id: uuid(),
        discussionId: discussion.id,
        parentId: null,
        content: comment.content,
        now: new Date(comment.createdAt)
      },
      {
        ...context,
        user: comment.user
      }
    )
  })

  const comment = await pgdb.public.comments.findFirst({
    discussionId: discussion.id
  })
  await pgdb.public.comments.updateOne(
    { id: comment.id },
    {
      mentioningRepoId: 'republik-dev/article-das-reaktionaerste-land-der-welt',
      mentioningFragmentId: 'ein-struktureller-wahnsinn'
    }
  )

  return connections
})
  .then(async ({ pgdb, redis, pubsub, elastic }) => {
    await PgDb.disconnect(pgdb)
    await Redis.disconnect(redis)
    await RedisPubSub.disconnect(pubsub)
    await Elasticsearch.disconnect(elastic)
  }).catch(e => {
    console.error(e)
    process.exit(1)
  })
