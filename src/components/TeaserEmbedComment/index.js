import React from 'react'
import CommentTeaser from '../CommentTeaser/CommentTeaser'

const TeaserEmbedComment = ({ savedData, liveData, t }) => (
  <CommentTeaser
    createdAt={new Date(liveData.createdAt)}
    displayAuthor={liveData.displayAuthor}
    preview={{
      string: savedData.text,
      more: false
    }}
    discussion={liveData.discussion}
    t={t}
  />
)

export default TeaserEmbedComment

TeaserEmbedComment.data = {
  config: {
    skip: props => !props.data,
    options: ({ data }) => ({
      variables: {
        id: data.id
      },
      ssr: false
    }),
    props: ({ data }) => {
      return {
        liveData: {
          loading: data.loading,
          error: data.error,
          ...data.comments?.focus
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
