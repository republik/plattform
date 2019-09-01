import React from 'react'
import { css } from 'glamor'

import {
  matchZone
} from 'mdast-react-render/lib/utils'

import {
  TeaserFeed
} from '../../components/TeaserFeed'

import {
  TeaserActiveDebates
} from '../../components/TeaserActiveDebates'

import {
  TeaserSectionTitle
} from '../../components/TeaserShared'

import Center from '../../components/Center'
import Loader from '../../components/Loader'
import * as Editorial from '../../components/Typography/Editorial'

import { mUp } from '../../theme/mediaQueries'

const styles = {
  feedContainer: css({
    paddingTop: 10,
    paddingBottom: 10,
    [mUp]: {
      paddingTop: 55,
      paddingBottom: 55
    }
  }),
  dialogContainer: css({
    paddingTop: 10,
    paddingBottom: 10,
    [mUp]: {
      paddingTop: 30,
      paddingBottom: 30
    }
  })
}

const DefaultLink = ({ children }) => children
const withData = Component => props => <Component {...props} data={{}} />

const createLiveTeasers = ({
  Link = DefaultLink,
  CommentLink = DefaultLink,
  DiscussionLink = DefaultLink,
  t,
  withFeedData = withData,
  withDiscussionsData = withData
}) => {
  const extractRepoIds = children => {
    if (!children) {
      return []
    }
    return children.reduce(
      (all, node) => all
        .concat((node.data && node.data.urlMeta && node.data.urlMeta.repoId) || [])
        .concat(extractRepoIds(node.children)),
      []
    )
  }

  return [
    {
      matchMdast: node => matchZone('LIVETEASER')(node) && node.data.id === 'feed',
      props: (node, index, parent) => {
        const priorChildren = parent.children.slice(0, index)
        return {
          lastPublishedAt: parent.lastPublishedAt,
          priorRepoIds: Array.from(new Set(extractRepoIds(priorChildren))),
          ...node.data
        }
      },
      component: withFeedData(({ attributes, data, url, label }) => {
        return <Center attributes={attributes}>
          <Loader
            error={data.error}
            loading={data.loading}
            render={() => {
              return (
                <div {...styles.feedContainer}>
                  {data.feed && data.feed.nodes.map(node => {
                    const doc = node.entity || node
                    return (
                      <TeaserFeed
                        {...doc.meta}
                        title={doc.meta.shortTitle || doc.meta.title}
                        description={!doc.meta.shortTitle && doc.meta.description}
                        kind={
                          doc.meta.template === 'editorialNewsletter'
                            ? 'meta'
                            : doc.meta.kind
                        }
                        t={t}
                        Link={Link}
                        key={doc.meta.path} />
                    )
                  })}
                  <Link href={url} passHref>
                    <Editorial.A href={url}>{label}</Editorial.A>
                  </Link>
                </div>
              )
            }} />
        </Center>
      }),
      isVoid: true,
      editorModule: 'liveteaser',
      editorOptions: {
        type: 'LIVETEASERFEED',
        insertButtonText: 'Feed Teaser',
        insertId: 'feed',
        form: [
          {
            key: 'label'
          },
          {
            key: 'url'
          },
          {
            key: 'minPublishDate',
            note: 'Minimales Publikationsdatum des Feeds. Leer lassen für automatisch – ab dem gleichen Tag wie die Front zuletzt publiziert wurde.'
          },
          {
            key: 'excludeRepoIds',
            note: 'Vorherige Artikel werden automatisch ausgeschlossen. Nur im Spezialfall hier Komma-separierte Repo-IDs eintragen.'
          }
        ]
      }
    },
    {
      matchMdast: node => matchZone('LIVETEASER')(node) && node.data.id === 'dialog',
      props: node => node.data,
      component: withDiscussionsData(({ attributes, data, url, label }) => {
        return <Center attributes={attributes}>
          <Loader
            error={data.error}
            loading={data.loading}
            render={() => {
              return (
                <div {...styles.dialogContainer}>
                  <TeaserActiveDebates
                    t={t}
                    CommentLink={CommentLink}
                    DiscussionLink={DiscussionLink}
                    discussions={data.discussions}
                  >
                    <Link href={url} passHref>
                      <TeaserSectionTitle href={url}>
                        {label}
                      </TeaserSectionTitle>
                    </Link>
                  </TeaserActiveDebates>
                </div>
              )
            }} />
        </Center>
      }),
      isVoid: true,
      editorModule: 'liveteaser',
      editorOptions: {
        type: 'LIVETEASERDIALOG',
        insertButtonText: 'Dialog Teaser',
        insertId: 'dialog',
        form: [
          {
            key: 'label'
          },
          {
            key: 'url'
          },
          {
            key: 'lastDays',
            note: 'Default 3'
          },
          {
            key: 'highlightId',
            note: 'Kommentar-ID (focus-Wert im URL)'
          },
          {
            key: 'highlightQuote',
            note: 'Zitat aus dem Kommentar'
          }
        ]
      }
    }
  ]
}

export default createLiveTeasers
