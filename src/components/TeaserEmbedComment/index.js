import React from 'react'
import * as Comment from '../Discussion/Internal/Comment'
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

  const metaDataComment = liveData?.comment
    ? {
        ...liveData?.comment,
        // content is based on thise dates
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }
    : {
        // placeholder while loading or if no longer available
        id: data.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        published: liveData ? false : true,
        unavailable: liveData && !liveData.loading,
        displayAuthor: {
          name: t('styleguide/comment/header/loading')
        },
        discussion: data.discussion || {}
      }

  const contentComment = data

  const clock = {
    t,
    isDesktop
  }
  const discussionContextValue = {
    discussion: metaDataComment.discussion,
    clock,
    Link
  }
  return (
    <DiscussionContext.Provider value={discussionContextValue}>
      <div id={data.id} {...styles.root} {...colorScheme.set('color', 'text')}>
        <Comment.Header t={t} comment={metaDataComment} />
        <div style={{ margin: '10px 0' }}>
          <Comment.Body
            t={t}
            comment={contentComment}
            context={
              contentComment.tags && contentComment.tags[0]
                ? { title: contentComment.tags[0] }
                : undefined
            }
          />
        </div>
        <DiscussionFooter comment={metaDataComment} t={t} Link={Link} />
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
      }
    })
  },
  query: `
    query getLiveCommentEmbed($id: ID!) {
      comment(id: $id) {
        id
        createdAt
        updatedAt
        tags
        parentIds
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
