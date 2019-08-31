import React from 'react'


import {
  matchType,
  matchZone,
  matchParagraph,
  matchHeading,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'

import {
  TeaserFeed
} from '../../components/TeaserFeed'

import Center from '../../components/Center'
import Loader from '../../components/Loader'
import * as Editorial from '../../components/Typography/Editorial'

const createLiveTeasers = ({
  Link,
  withFeedData,
  t
}) => {
  return [
    {
      matchMdast: node => matchZone('LIVETEASER')(node) && node.data.id === 'feed',
      props: node => node.data,
      component: withFeedData(({ attributes, data }) => {
        return <Center attributes={attributes}>
          <Loader
            error={data.error}
            loading={data.loading}
            render={() => {
              return (
                <>
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
                  <Editorial.A>Alles Neuste</Editorial.A>
                </>
              )
            }
            } />
        </Center>
      }),
      isVoid: true,
      editorModule: 'liveteaser',
      editorOptions: {
        type: 'LIVETEASERFEED',
        insertButtonText: 'Live Teaser',
        priorRepoIds: true,
        form: [
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
    }
  ]
}

export default createLiveTeasers
