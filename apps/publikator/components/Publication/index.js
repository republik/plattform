import React, { useState } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import withT from '../../lib/withT'
import { Loader, ColorContextProvider } from '@project-r/styleguide'
import { css } from 'glamor'

import DarkmodeToggle from './DarkmodeToggle'
import PublicationForm from './PublicationForm'

import PreviewFrame from '../PreviewFrame'
import RepoArchivedBanner from '../Repo/ArchivedBanner'
import ScreeenSizePicker from '../ScreenSizePicker'

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
}

const Preview = ({ commit }) => {
  const [previewScreenSize, setPreviewScreenSize] = useState('phone')
  const [previewDarkmode, setPreviewDarkmode] = useState(false)
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
        </div>
        <div>
          <PreviewFrame
            previewScreenSize={previewScreenSize}
            repoId={commit.document.repoId}
            commitId={commit.id}
            darkmode={previewDarkmode}
            sideBarWidth={PUBLICATION_COLUMN_WIDTH}
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

          if (isArchived) {
            return <RepoArchivedBanner />
          }

          return (
            <>
              <div {...styles.formContainer}>
                <PublicationForm t={t} repo={repo} commit={commit} />
              </div>
              <Preview commit={commit} />
            </>
          )
        }}
      />
    </>
  )
}

export default compose(withT, graphql(getRepoWithCommit))(PublishForm)
