import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'
import { Loader } from '@project-r/styleguide'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import withT from '../../lib/withT'
import Nav from '../editor/Nav'
import Frame from '../Frame'
import Preview from '../Preview'
import RepoArchivedBanner from '../Repo/ArchivedBanner'

import PublicationForm from './PublicationForm'

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
            audioSource {
              mp3
              kind
            }
          }
          documentSubscribedBy: subscribedBy(
            filters: [Document]
            includeParents: true
            onlyEligibles: true
            uniqueUsers: true
          ) {
            totalCount
          }
          readAloudSubscribedBy: subscribedBy(
            filters: [ReadAloud]
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
  formContainer: css({
    position: 'fixed',
    height: '100%',
    right: 0,
    width: '500px',
    backgroundColor: 'white',
    overflow: 'scroll',
    overscrollBehavior: 'contain',
  }),
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
          return (
            <Frame>
              <Frame.Header>
                <Frame.Header.Section align='left'>
                  <Nav />
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
                    <Preview
                      repoId={commit.document.repoId}
                      commitId={commit.id}
                      sideBarWidth={PUBLICATION_COLUMN_WIDTH}
                      commitOnly={true}
                    />
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
