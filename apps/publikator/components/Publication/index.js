import { useState } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import withT from '../../lib/withT'
import { Loader, ColorContextProvider } from '@project-r/styleguide'
import { css } from 'glamor'

import DarkmodeToggle from './DarkmodeToggle'
import HasAccessToggle from './HasAccessToggle'
import PublicationForm from './PublicationForm'

import PreviewFrame from '../PreviewFrame'
import RepoArchivedBanner from '../Repo/ArchivedBanner'
import ScreeenSizePicker from '../ScreenSizePicker'
import Frame from '../Frame'
import NavWithFlyer from '../Edit/NavWithFlyer'

const PUBLICATION_COLUMN_WIDTH = 500

export const getRepoWithCommit = gql`
  query repoWithCommit($repoId: ID!, $commitId: ID!) {
    repo(id: $repoId) {
      id
      isArchived
      meta {
        publishDate
      }
      latestPublications {
        date
        name
        live
        prepublication
        scheduledAt
      }
      commit(id: $commitId) {
        id
        message
        date
        author {
          email
          name
        }
        document {
          id
          type
          repoId
          content
          meta {
            slug
            emailSubject
            template
            title
            description
            image
            facebookTitle
            facebookDescription
            facebookImage
            twitterTitle
            twitterDescription
            twitterImage
            shareText
            format {
              id
              repoId
              meta {
                path
                title
                color
                kind
                externalBaseUrl
              }
            }
            section {
              id
              repoId
              meta {
                path
                title
                color
                kind
              }
            }
            series {
              title
              description
              logo
              logoDark
              overview {
                id
                repoId
                meta {
                  path
                }
              }
              episodes {
                title
                publishDate
                label
                lead
                image
                document {
                  id
                  repoId
                  meta {
                    path
                  }
                }
              }
            }
          }
          subscribedBy(
            includeParents: true
            onlyEligibles: true
            uniqueUsers: true
          ) {
            totalCount
          }
        }
      }
    }
  }
`

const styles = {
  container: css({
    display: 'flex',
  }),
  formContainer: css({
    position: 'fixed',
    height: '100%',
    right: 0,
    width: '500px',
    backgroundColor: 'white',
    overflow: 'scroll',
    overscrollBehavior: 'contain',
  }),
  column: css({
    padding: '1em',
  }),
  darkmodeButton: css({
    position: 'absolute',
    margin: '-26px 0 0 32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  hasPreviewButton: css({
    position: 'absolute',
    margin: '-26px 0 0 64px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }),
}

const Preview = ({ commit, isFlyer }) => {
  const [previewScreenSize, setPreviewScreenSize] = useState('phone')
  const [previewDarkmode, setPreviewDarkmode] = useState(false)
  const [previewHasAccess, setPreviewHasAccess] = useState(true)
  return (
    <ColorContextProvider colorSchemeKey={previewDarkmode ? 'dark' : 'light'}>
      <div style={{ paddingTop: 40 }}>
        <div style={{ marginRight: PUBLICATION_COLUMN_WIDTH }}>
          <ScreeenSizePicker
            selectedScreenSize={previewScreenSize}
            onSelect={(screenSize) => {
              setPreviewScreenSize(screenSize)
            }}
            inline={true}
          />
          <div {...styles.darkmodeButton}>
            <DarkmodeToggle
              previewDarkmode={previewDarkmode}
              onToggle={() => setPreviewDarkmode(!previewDarkmode)}
            />
          </div>
          <div {...styles.hasPreviewButton}>
            <HasAccessToggle
              previewHasAccess={previewHasAccess}
              onToggle={() => setPreviewHasAccess(!previewHasAccess)}
            />
          </div>
        </div>
        <div>
          <PreviewFrame
            previewScreenSize={previewScreenSize}
            repoId={commit.document.repoId}
            commitId={commit.id}
            darkmode={previewDarkmode}
            hasAccess={previewHasAccess}
            sideBarWidth={PUBLICATION_COLUMN_WIDTH}
            isFlyer={isFlyer}
            commitOnly={true}
          />
        </div>
      </div>
    </ColorContextProvider>
  )
}

const PublishForm = ({ t, data }) => {
  const { loading, error, repo } = data

  return (
    <>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const { isArchived, commit } = repo
          const isFlyer = commit?.document?.type === 'slate'
          return (
            <Frame>
              <Frame.Header>
                <Frame.Header.Section align='left'>
                  <NavWithFlyer isFlyer={isFlyer} />
                </Frame.Header.Section>
                <Frame.Header.Section align='right'>
                  <Frame.Me />
                </Frame.Header.Section>
              </Frame.Header>
              <Frame.Body raw={true}>
                {isArchived ? (
                  <RepoArchivedBanner />
                ) : (
                  <>
                    <div {...styles.formContainer}>
                      <PublicationForm t={t} repo={repo} commit={commit} />
                    </div>
                    <Preview commit={commit} isFlyer={isFlyer} />
                  </>
                )}
              </Frame.Body>
            </Frame>
          )
        }}
      />
    </>
  )
}

export default compose(withT, graphql(getRepoWithCommit))(PublishForm)
