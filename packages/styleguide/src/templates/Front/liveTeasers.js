import React from 'react'
import { css } from 'glamor'

import { matchZone } from 'mdast-react-render/lib/utils'

import { TeaserFeed } from '../../components/TeaserFeed'

import { TeaserActiveDebates } from '../../components/TeaserActiveDebates'

import { TeaserSectionTitle } from '../../components/TeaserShared'
import { TeaserMyMagazine } from '../../components/TeaserMyMagazine'

import Center from '../../components/Center'
import Loader from '../../components/Loader'
import LazyLoad from '../../components/LazyLoad'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  feedContainer: css({
    paddingTop: 10,
    paddingBottom: 10,
    [mUp]: {
      paddingTop: 55,
      paddingBottom: 55
    }
  })
}

const LAZYLOADER_DIALOG_HEIGHT = 300
const LAZYLOADER_MYMAGAZINE_HEIGHT = 210

const DefaultLink = ({ children }) => children
const withData = Component => props => <Component {...props} data={{}} />
const Placeholder = ({ attributes, children, minHeight }) => (
  <div
    attributes={attributes}
    style={{
      padding: '20px 0',
      backgroundColor: '#111',
      color: '#f0f0f0',
      textAlign: 'center',
      minHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {children}
  </div>
)

const createLiveTeasers = ({
  Link = DefaultLink,
  CommentLink = DefaultLink,
  DiscussionLink = DefaultLink,
  t,
  withFeedData = withData,
  withDiscussionsData = withData,
  withMyMagazineData = withData,
  ActionBar,
  showMyMagazine = true
}) => {
  const MyMagazineWithData = withMyMagazineData(
    ({
      data,
      title,
      bookmarksUrl,
      bookmarksLabel,
      notificationsUrl,
      notificationsLabel,
      placeholder
    }) => {
      return (
        <Loader
          error={data.error}
          loading={data.loading}
          style={{ minHeight: LAZYLOADER_MYMAGAZINE_HEIGHT }}
          render={() => {
            return (
              <TeaserMyMagazine
                placeholder={placeholder}
                latestSubscribedArticles={data.latestSubscribedArticles}
                latestProgressOrBookmarkedArticles={
                  data.latestProgressOrBookmarkedArticles
                }
                title={title}
                bookmarksLabel={bookmarksLabel}
                bookmarksUrl={bookmarksUrl}
                notificationsLabel={notificationsLabel}
                notificationsUrl={notificationsUrl}
                Link={Link}
                ActionBar={ActionBar}
              />
            )
          }}
        />
      )
    }
  )

  const DiscussionWithData = withDiscussionsData(
    ({ attributes, data, url, label }) => {
      return (
        <Loader
          error={data.error}
          loading={data.loading}
          style={{ minHeight: LAZYLOADER_DIALOG_HEIGHT }}
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
                    <TeaserSectionTitle href={url}>{label}</TeaserSectionTitle>
                  </Link>
                </TeaserActiveDebates>
              </div>
            )
          }}
        />
      )
    }
  )

  const extractRepoIds = children => {
    if (!children) {
      return []
    }
    return children.reduce(
      (all, node) =>
        all
          .concat(
            (node.data && node.data.urlMeta && node.data.urlMeta.repoId) || []
          )
          .concat(extractRepoIds(node.children)),
      []
    )
  }

  return [
    {
      matchMdast: node =>
        matchZone('LIVETEASER')(node) && node.data.id === 'feed',
      props: (node, index, parent) => {
        const priorChildren = parent.children.slice(0, index)
        return {
          lastPublishedAt: parent.lastPublishedAt,
          priorRepoIds: Array.from(new Set(extractRepoIds(priorChildren))),
          ...node.data
        }
      },
      component: withFeedData(({ attributes, data, url, label }) => {
        return (
          <Center attributes={attributes}>
            <Loader
              error={data.error}
              loading={data.loading}
              render={() => {
                return (
                  <div {...styles.feedContainer}>
                    {data.feed &&
                      data.feed.nodes.map(node => {
                        const doc = node.entity || node
                        return (
                          <TeaserFeed
                            {...doc.meta}
                            title={doc.meta.shortTitle || doc.meta.title}
                            description={
                              !doc.meta.shortTitle && doc.meta.description
                            }
                            kind={
                              doc.meta.template === 'editorialNewsletter'
                                ? 'meta'
                                : doc.meta.kind
                            }
                            t={t}
                            Link={Link}
                            key={doc.meta.path}
                          />
                        )
                      })}
                    <Link href={url} passHref>
                      <TeaserSectionTitle small href={url}>
                        {label}
                      </TeaserSectionTitle>
                    </Link>
                  </div>
                )
              }}
            />
          </Center>
        )
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
            note:
              'Minimales Publikationsdatum des Feeds. Leer lassen für automatisch – ab dem gleichen Tag wie die Front zuletzt publiziert wurde.'
          },
          {
            key: 'excludeRepoIds',
            ref: 'repoIds',
            note: 'Vorherige Artikel werden automatisch ausgeschlossen.'
          },
          {
            key: 'specificRepoIds',
            ref: 'repoIds',
            note:
              'Gewinnt gegen alles aber die Dokumente müssen immer noch im Feed sein.'
          }
        ]
      }
    },
    {
      matchMdast: node =>
        matchZone('LIVETEASER')(node) && node.data.id === 'dialog',
      props: node => node.data,
      component: props => {
        return (
          <LazyLoad style={{ minHeight: LAZYLOADER_DIALOG_HEIGHT }}>
            <DiscussionWithData {...props} />
          </LazyLoad>
        )
      },
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
            key: 'first',
            note: 'Anzahl Debatten, default 4'
          },
          {
            key: 'featured',
            note: 'Anzahl Beiträge, 0 für keine, default 1'
          }
        ]
      }
    },
    {
      matchMdast: node =>
        matchZone('LIVETEASER')(node) && node.data.id === 'mymagazine',
      props: node => node.data,
      component: props => {
        if (!showMyMagazine) {
          return null
        }
        return (
          <LazyLoad
            style={{
              minHeight: LAZYLOADER_MYMAGAZINE_HEIGHT
            }}
          >
            <MyMagazineWithData
              placeholder={
                props.editorPreview && (
                  <Placeholder minHeight={LAZYLOADER_MYMAGAZINE_HEIGHT}>
                    Meine Republik
                  </Placeholder>
                )
              }
              {...props}
            />
          </LazyLoad>
        )
      },
      isVoid: true,
      editorModule: 'liveteaser',
      editorOptions: {
        type: 'LIVETEASERMYMAGAZINE',
        insertButtonText: 'Meine Republik',
        insertId: 'mymagazine',
        form: [
          {
            key: 'title'
          },
          {
            key: 'bookmarksLabel'
          },
          {
            key: 'bookmarksUrl'
          },
          {
            key: 'notificationsLabel'
          },
          {
            key: 'notificationsUrl'
          }
        ]
      }
    },
    {
      matchMdast: node =>
        matchZone('LIVETEASER')(node) && node.data.id === 'end',
      props: node => node.data,
      component: ({ attributes, data, url, label }) => {
        return <Placeholder attributes={attributes}>The End</Placeholder>
      },
      isVoid: true,
      editorModule: 'liveteaser',
      editorOptions: {
        type: 'LIVETEASEREND',
        insertButtonText: 'The End',
        insertId: 'end'
      }
    }
  ]
}

export default createLiveTeasers
