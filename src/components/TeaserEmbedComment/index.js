import React from 'react'
import * as Comment from '../Discussion/Internal/Comment'
import { parse } from '@orbiting/remark-preset'
import DiscussionFooter from '../CommentTeaser/DiscussionFooter'
import { DiscussionContext } from '../Discussion/DiscussionContext'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { mUp } from '../../theme/mediaQueries'
import { css } from 'glamor'
import { useColorContext } from '../Colors/ColorContext'

const styles = {
  root: css({
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: 'left',
    margin: '36px auto',
    position: 'relative',
    maxWidth: '455px',
    whiteSpace: 'normal',
    [mUp]: {
      margin: '45px auto'
    }
  })
}

const TeaserEmbedComment = ({ data, liveData, t, Link }) => {
  const isDesktop = useMediaQuery(mUp)
  const [colorScheme] = useColorContext()
  const displayComment =
    liveData.comment.published && !liveData.comment.adminUnpublished
  const comment = {
    ...liveData.comment,
    content: displayComment && parse(data.text)
  }
  const clock = {
    t,
    isDesktop
  }
  const discussionContextValue = { discussion: comment.discussion, clock, Link }
  return (
    <DiscussionContext.Provider value={discussionContextValue}>
      <div
        id={comment.id}
        {...styles.root}
        {...colorScheme.set('color', 'text')}
      >
        <Comment.Header t={t} comment={comment} />
        <div style={{ margin: '10px 0' }}>
          <Comment.Body
            t={t}
            comment={comment}
            context={comment.tags[0] ? { title: comment.tags[0] } : undefined}
          />
        </div>
        <DiscussionFooter comment={comment} t={t} Link={Link} />
      </div>
    </DiscussionContext.Provider>
  )
}

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
    })
  },
  query: `
    query getLiveCommentEmbed($id: ID!) {
      comment(id: $id) {
        id
        createdAt
        updatedAt
        published
        adminUnpublished
        tags
        displayAuthor {
          id
          name
          slug
          credential {
            description
            verified
          }
          profilePicture
        }
        discussion {
          id
          title
          path
          document {
            id
            meta {
              title
              path
            }
          }
        }
      }
    }
  `
}
