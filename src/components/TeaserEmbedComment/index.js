import React from 'react'
import CommentTeaser from '../CommentTeaser/CommentTeaser'

const TeaserEmbedComment = ({ data, liveData, t }) => (
  <CommentTeaser
    createdAt={new Date(liveData?.createdAt)}
    displayAuthor={liveData?.displayAuthor}
    preview={{
      string: data?.text || 'Ein Kommentar',
      more: false
    }}
    discussion={liveData?.discussion}
    t={t}
  />
)

export default TeaserEmbedComment

TeaserEmbedComment.data = {
  config: {
    name: 'liveData',
    skip: props => !props.data,
    options: ({ data }) => ({
      variables: {
        id: data.id
      },
      ssr: false
    }),
    props: ({ liveData }) => {
      return {
        liveData: {
          loading: liveData.loading,
          error: liveData.error,
          ...liveData.comments?.focus
        }
      }
    }
  },
  query: `
    query getCommentEmbed($id: ID!) {
      comments(focusId: $id) {
        focus {
          id
          createdAt
          displayAuthor {
            id
            name
            profilePicture
            credential {
              description
              verified
            }
          }
          discussion {
            title
          }
        }
      }
    }
  `
}
