import React from 'react'
import { css } from 'glamor'

import { mUp } from '../../theme/mediaQueries'
import { inQuotes } from '../../lib/inQuotes'
import { useMediaQuery } from '../../lib/useMediaQuery'

import { sansSerifMedium15 } from '../Typography/styles'
import { A } from '../Typography/'
import { IconLink } from '../Discussion/Internal/Comment'
import RelativeTime from '../Discussion/Internal/Comment/RelativeTime'
import { useColorContext } from '../Colors/ColorContext'

const styles = {
  footer: css({
    ...sansSerifMedium15,
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative'
  })
}

const DefaultLink = ({ children }) => children

export const DiscussionFooter = ({ t, Link = DefaultLink, comment }) => {
  const { id, discussion, parentIds, createdAt } = comment
  const isDesktop = useMediaQuery(mUp)
  const [colorScheme] = useColorContext()
  const commentCount = discussion?.comments?.totalCount
  const clock = {
    t,
    isDesktop
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
                <Link
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
                      verticalAlign: 'top'
                    }}
                  />
                </Link>
              ),
              link: (
                <Link
                  key={`link-title-${id}`}
                  comment={comment}
                  discussion={discussion}
                  passHref
                >
                  <A>{inQuotes(discussion.title)}</A>
                </Link>
              )
            }
          )}
        </div>
      )}
      {!comment.displayAuthor && (
        <div {...styles.timeago} {...colorScheme.set('color', 'textSoft')}>
          <Link comment={comment} discussion={discussion} passHref>
            <a {...styles.linkUnderline}>
              <RelativeTime {...clock} date={createdAt} />
            </a>
          </Link>
        </div>
      )}
    </div>
  )
}

export default DiscussionFooter
