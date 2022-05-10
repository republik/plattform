import React from 'react'
import * as Comment from '../Discussion/Internal/Comment'
import DiscussionFooter from '../CommentTeaser/DiscussionFooter'
import { DiscussionContext } from '../Discussion/DiscussionContext'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { mUp } from '../../theme/mediaQueries'
import { css, merge } from 'glamor'
import { useColorContext } from '../Colors/ColorContext'
import { plainLinkRule } from '../Typography'

const styles = {
  root: css({
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: 'left',
    margin: '0 auto',
    position: 'relative',
    maxWidth: '455px',
    whiteSpace: 'normal',
    [mUp]: {
      margin: '0 auto',
    },
  }),
  isLast: css({
    marginBottom: 36,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    [mUp]: {
      marginBottom: 45,
    },
  }),
  isFirst: css({
    marginTop: 36,
    [mUp]: {
      marginTop: 45,
    },
  }),
}

const TeaserEmbedComment = ({
  data,
  liveData,
  t,
  CommentLink,
  isFirst,
  isLast,
}) => {
  const isDesktop = useMediaQuery(mUp)
  const [colorScheme] = useColorContext()

  const metaDataComment = liveData?.comment
    ? {
        ...liveData?.comment,
        // content is based on thise dates
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      }
    : {
        // placeholder while loading or if no longer available
        id: data.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        published: liveData ? false : true,
        unavailable: liveData && !liveData.loading,
        displayAuthor: {
          name: t('styleguide/comment/header/loading'),
        },
        discussion: data.discussion || {},
      }

  const contentComment = data

  const clock = {
    t,
    isDesktop,
  }
  const discussionContextValue = {
    discussion: metaDataComment.discussion,
    clock,
    CommentLink,
  }
  return (
    <DiscussionContext.Provider value={discussionContextValue}>
      <div
        id={data.id}
        {...merge(
          styles.root,
          isFirst && styles.isFirst,
          isLast && styles.isLast,
        )}
        {...colorScheme.set('color', 'text')}
      >
        <Comment.Header
          t={t}
          comment={metaDataComment}
          discussion={discussionContextValue.discussion}
        />
        <CommentLink
          comment={metaDataComment}
          discussion={discussionContextValue.discussion}
          passHref
        >
          <a {...plainLinkRule}>
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
          </a>
        </CommentLink>
        <DiscussionFooter
          comment={metaDataComment}
          t={t}
          CommentLink={CommentLink}
        />
      </div>
    </DiscussionContext.Provider>
  )
}

export default TeaserEmbedComment

TeaserEmbedComment.data = {
  config: {
    name: 'liveData',
    skip: (props) => !props.data,
    options: ({ data }) => ({
      variables: {
        id: data.id,
      },
    }),
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
              template
              title
              path
              ownDiscussion {
                id
              }
            }
          }
        }
      }
    }
  `,
}
