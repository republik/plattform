import { css } from 'glamor'
import React from 'react'
import ActiveDebateHeader from './DebateHeader'
import ActiveDebateComment from './DebateComment'
import { mUp } from '../../theme/mediaQueries'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { Header as UserProfile } from '../Discussion/Internal/Comment'
import { DiscussionContext } from '../Discussion/DiscussionContext'
import { sansSerifRegular14 } from '../Typography/styles'
import { useColorContext } from '../Colors/ColorContext'

const styles = {
  root: css({
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    margin: '0 0 30px 0',
    paddingTop: 10,
  }),
  footer: css({
    ...sansSerifRegular14,
    display: 'flex',
    justifyContent: 'flex-start',
  }),
  profilePicture: css({
    display: 'block',
    width: `40px`,
    flex: `0 0 40px`,
    height: `40px`,
    marginRight: '8px',
  }),
  commentMeta: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  }),
}

const DefaultLink = ({ children }) => children

/**
 * @typedef {object} DebateTeaserProps
 * @property {import('../../lib/translate').Formatter} t
 * @property {object} discussion
 * @property {React.ComponentType} [DiscussionLink]
 * @property {React.ComponentType} [CommentLink]
 */

/**
 * DebateTeaser component
 * @param {DebateTeaserProps} props
 */
export const DebateTeaser = ({
  t,
  discussion,
  DiscussionLink = DefaultLink,
  CommentLink = DefaultLink,
}) => {
  const [colorScheme] = useColorContext()
  const isDesktop = useMediaQuery(mUp)

  /*
   * A reduced version of DiscussionContext value, just enough so we can render
   * the Comment Header component.
   */
  const discussionContextValue = {
    discussion,
    clock: {
      isDesktop,
      t,
    },
    CommentLink,
  }

  return (
    <DiscussionContext.Provider value={discussionContextValue}>
      <div {...styles.root} {...colorScheme.set('borderColor', 'divider')}>
        <DiscussionLink discussion={discussion} passHref>
          <ActiveDebateHeader
            t={t}
            title={discussion.title}
            commentCount={discussion.comments.totalCount}
            href={discussion.path}
          />
        </DiscussionLink>
        {discussion.comments.nodes.map((comment, i, all) => (
          <div
            key={comment.id}
            style={{ marginBottom: i !== all.length - 1 ? 30 : 0 }}
          >
            <CommentLink discussion={discussion} comment={comment} passHref>
              <ActiveDebateComment
                t={t}
                id={comment.id}
                highlight={comment.highlight ? comment.highlight : undefined}
                preview={comment.preview}
              />
            </CommentLink>
            <UserProfile // TODO: Links need to be fixed due to changes in the discussion refactoring
              CommentLink={CommentLink}
              t={t}
              comment={comment}
              isExpanded={true}
            />
          </div>
        ))}
      </div>
    </DiscussionContext.Provider>
  )
}

export default DebateTeaser
