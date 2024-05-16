import React from 'react'
import { css } from 'glamor'

import { mUp } from '../../theme/mediaQueries'
import { inQuotes } from '../../lib/inQuotes'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { underline } from '../../lib/styleMixins'

import { sansSerifMedium15 } from '../Typography/styles'
import { A } from '../Typography'
import { IconLink } from '../Discussion/Internal/Comment'
import RelativeTime from '../Discussion/Internal/Comment/RelativeTime'
import { useColorContext } from '../Colors/ColorContext'
import {
  CommentLinkProps,
  DefaultCommentLink,
} from '../Discussion/Internal/Comment/CommentLink'
import { Formatter } from '../../lib/translate'
import { Comment } from '../Discussion/Internal/Comment/types'

const styles = {
  footer: css({
    ...sansSerifMedium15,
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
  }),
  linkUnderline: css({
    color: 'inherit',
    textDecoration: 'none',
    '@media (hover)': {
      '[href]:hover': underline,
    },
  }),
  timeago: css({
    flexShrink: 0,
    paddingLeft: 10,
  }),
}

type DiscussionFooterProps = {
  t: Formatter
  CommentLink?: React.ComponentType<CommentLinkProps>
  comment: Comment
}

export const DiscussionFooter = ({
  t,
  CommentLink = DefaultCommentLink,
  comment,
}: DiscussionFooterProps) => {
  const { id, discussion, parentIds, createdAt } = comment
  const isDesktop = useMediaQuery(mUp)
  const [colorScheme] = useColorContext()
  const commentCount = discussion?.comments?.totalCount
  const clock = {
    t,
    isDesktop,
  }
  return (
    <div {...styles.footer}>
      {discussion?.title && (
        <div>
          {t.elements(
            `styleguide/CommentTeaser/${
              parentIds && parentIds.length
                ? 'reply'
                : commentCount
                ? 'commentWithCount'
                : 'comment'
            }/link`,
            {
              count: (
                <CommentLink
                  key={`link-count-${id}`}
                  comment={comment}
                  discussion={discussion}
                  passHref
                >
                  <IconLink
                    discussionCommentsCount={commentCount}
                    small
                    style={{
                      marginTop: -2,
                      paddingRight: 0,
                      verticalAlign: 'top',
                    }}
                  />
                </CommentLink>
              ),
              link: (
                <CommentLink
                  key={`link-title-${id}`}
                  comment={comment}
                  discussion={discussion}
                  passHref
                >
                  <A>{inQuotes(discussion.title)}</A>
                </CommentLink>
              ),
            },
          )}
        </div>
      )}
      {!comment.displayAuthor && (
        <div {...styles.timeago} {...colorScheme.set('color', 'textSoft')}>
          <CommentLink comment={comment} discussion={discussion} passHref>
            <a {...styles.linkUnderline}>
              <RelativeTime {...clock} date={createdAt} />
            </a>
          </CommentLink>
        </div>
      )}
    </div>
  )
}

export default DiscussionFooter
