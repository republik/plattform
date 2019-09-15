import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import { ActiveDebateComment, ActiveDebateHeader } from '.'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { Header as UserProfile } from '../Discussion/Internal/Comment'
import { DiscussionContext } from '../Discussion/DiscussionContext'
import { sansSerifMedium16, sansSerifRegular14 } from '../Typography/styles'

const styles = {
  root: css({
    borderTop: `1px solid #C8C8C8`,
    margin: '0 0 30px 0',
    paddingTop: 10
  }),
  footer: css({
    ...sansSerifRegular14,
    display: 'flex',
    justifyContent: 'flex-start'
  }),
  profilePicture: css({
    display: 'block',
    width: `40px`,
    flex: `0 0 40px`,
    height: `40px`,
    marginRight: '8px'
  }),
  commentMeta: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'flex-start'
  }),
  authorName: css({
    flexShrink: 0,
    paddingLeft: 10,
    color: colors.text,
    ...sansSerifMedium16
  }),
  timeago: css({
    color: colors.lightText,
    flexShrink: 0,
    paddingLeft: 10
  })
}

const DefaultLink = ({ children }) => children

export const DebateTeaser = ({
  t,
  discussion,
  DiscussionLink = DefaultLink,
  CommentLink = DefaultLink
}) => {
  const isDesktop = useMediaQuery(mUp)

  /*
   * A reduced version of DiscussionContext value, just enough so we can render
   * the Comment Header component.
   */
  const links = {
    Profile: ({ displayAuthor, ...props }) => (
      <CommentLink {...props} discussion={discussion} displayAuthor={displayAuthor} />
    ),
    Comment: ({ comment, ...props }) => <CommentLink {...props} discussion={discussion} commentId={comment.id} />
  }
  const discussionContextValue = {
    discussion,
    clock: {
      now: Date.now(),
      isDesktop,
      t
    },
    links
  }

  return (
    <DiscussionContext.Provider value={discussionContextValue}>
      <div {...styles.root}>
        <DiscussionLink discussion={discussion} passHref>
          <ActiveDebateHeader
            t={t}
            title={discussion.title}
            commentCount={discussion.comments.totalCount}
            href={discussion.path}
          />
        </DiscussionLink>
        {discussion.comments.nodes.map((comment, i, all) => (
          <div key={comment.id} style={{ marginBottom: i !== all.length - 1 ? 30 : 0 }}>
            <links.Comment comment={comment} passHref>
              <ActiveDebateComment
                t={t}
                id={comment.id}
                highlight={comment.highlight ? comment.highlight : undefined}
                preview={comment.preview}
              />
            </links.Comment>
            <UserProfile t={t} comment={comment} isExpanded={true} />
          </div>
        ))}
      </div>
    </DiscussionContext.Provider>
  )
}

export default DebateTeaser

DebateTeaser.propTypes = {
  t: PropTypes.func,
  discussion: PropTypes.object
}
