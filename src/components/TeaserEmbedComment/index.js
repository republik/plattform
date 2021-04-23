import React from 'react'
import CommentTeaser from '../CommentTeaser/CommentTeaser'

const TeaserEmbedComment = ({
  createdAt,
  displayAuthor,
  id,
  discussion,
  text,
  t,
  attributes
}) => (
  <CommentTeaser
    attributes={attributes}
    createdAt={new Date(createdAt)}
    displayAuthor={displayAuthor}
    preview={{
      string: text,
      more: false
    }}
    discussion={discussion}
    t={t}
  />
)

export default TeaserEmbedComment

TeaserEmbedComment.data = {
  config: {
    options: {
      ssr: false
    },
    props: ({ data }) => {
      return {
        data: {
          loading: data.loading,
          error: data.error,
          displayAuthor: data.comments?.displayAuthor
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
          text
          discussion {
            title
          }
        }
      }
    }
  `
}
