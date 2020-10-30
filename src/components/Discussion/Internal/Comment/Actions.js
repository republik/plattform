import React, { useMemo } from 'react'
import { css, merge } from 'glamor'
import MdKeyboardArrowDown from 'react-icons/lib/md/keyboard-arrow-down'
import MdKeyboardArrowUp from 'react-icons/lib/md/keyboard-arrow-up'
// options: speaker-notes-off, block, clear, visibility-off, remove-circle
import CommentCountIcon from './CommentCountIcon'
import UnpublishIcon from 'react-icons/lib/md/visibility-off'
import ReportIcon from 'react-icons/lib/md/flag'
import EditIcon from 'react-icons/lib/md/edit'
import ReplyIcon from 'react-icons/lib/md/reply'
import ShareIcon from 'react-icons/lib/md/share'
import FeaturedIcon from 'react-icons/lib/md/star-outline'
import { sansSerifMedium14 } from '../../../Typography/styles'
import { DiscussionContext, formatTimeRelative } from '../../DiscussionContext'
import { timeFormat } from '../../../../lib/timeFormat'
import { useColorContext } from '../../../Colors/useColorContext'

const dateFormat = timeFormat('%d.%m.%Y')
const hmFormat = timeFormat('%H:%M')

const styles = {
  root: css({
    ...sansSerifMedium14,
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    marginLeft: '-7px'
  }),
  votes: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 'auto'
  }),
  vote: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }),
  voteDivider: css({
    padding: '0 2px'
  }),
  iconButton: css({
    outline: 'none',
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 'none',
    padding: '0',
    display: 'block',
    cursor: 'pointer',
    height: '100%',
    '& svg': {
      margin: '0 auto'
    }
  }),
  voteButton: css({
    lineHeight: 1,
    fontSize: '24px',
    textAlign: 'center',
    height: '40px',
    margin: 0,
    '& > svg': {
      display: 'block',
      flexShrink: 0
    }
  }),
  leftButton: css({
    fontSize: '18px',
    padding: '0 7px'
  }),
  text: css({
    display: 'inline-block',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    verticalAlign: 'middle',
    marginTop: -1,
    paddingLeft: 4,
    ...sansSerifMedium14
  })
}

export const Actions = ({
  t,
  comment,
  onExpand,
  onReply,
  onEdit,
  onReport
}) => {
  const {
    published,
    userCanEdit,
    downVotes,
    upVotes,
    userVote,
    numReports,
    userReportedAt,
    userCanReport,
    featuredAt,
    featuredText
  } = comment
  const { isAdmin, discussion, actions, clock } = React.useContext(
    DiscussionContext
  )
  const { displayAuthor, userWaitUntil } = discussion
  const onShare = () => actions.shareComment(comment)

  const canUnpublish = (isAdmin || userCanEdit) && published
  const onUnpublish = canUnpublish
    ? () => actions.unpublishComment(comment)
    : undefined
  const [colorScheme] = useColorContext()

  /*
   * The onClick functions are wired up such that when the user clicks a particular button twice,
   * they effectively undo their vote. Eg. if the user clicks on 'downvote', then a second
   * click on the downvote icon will 'unvote' their choice.
   */
  const { onUpvote, onDownvote } = (() => {
    if (!displayAuthor) {
      return { onUpvote: undefined, onDownvote: undefined }
    } else if (userVote === 'UP') {
      return {
        onUpvote: () => actions.unvoteComment(comment),
        onDownvote: () => actions.downvoteComment(comment)
      }
    } else if (userVote === 'DOWN') {
      return {
        onUpvote: () => actions.upvoteComment(comment),
        onDownvote: () => actions.unvoteComment(comment)
      }
    } else {
      return {
        onUpvote: () => actions.upvoteComment(comment),
        onDownvote: () => actions.downvoteComment(comment)
      }
    }
  })()

  const replyBlockedMessage = (() => {
    const waitUntilDate = userWaitUntil && new Date(userWaitUntil)
    if (waitUntilDate && waitUntilDate > clock.now) {
      return t('styleguide/CommentComposer/wait', {
        time: formatTimeRelative(waitUntilDate, clock)
      })
    }
  })()

  const handleReport = () => {
    if (window.confirm(t('styleguide/CommentActions/reportMessage'))) {
      onReport()
    }
  }

  return (
    <div {...styles.root} {...colorScheme.set('color', 'text')}>
      {onExpand && (
        <IconButton
          type='left'
          onClick={onExpand}
          title={t('styleguide/CommentActions/expand')}
        >
          <CommentCountIcon
            count={comment.comments && comment.comments.totalCount}
            small={true}
          />
        </IconButton>
      )}
      {onReply && !!displayAuthor && (
        <IconButton
          type='left'
          disabled={!!replyBlockedMessage}
          onClick={onReply}
          title={replyBlockedMessage || t('styleguide/CommentActions/answer')}
        >
          <ReplyIcon
            {...colorScheme.set(
              'fill',
              replyBlockedMessage ? 'disabled' : 'text'
            )}
          />
        </IconButton>
      )}
      {userCanEdit && onEdit && (
        <IconButton
          type='left'
          onClick={onEdit}
          title={t('styleguide/CommentActions/edit')}
        >
          <EditIcon />
        </IconButton>
      )}
      {onUnpublish && (
        <IconButton
          type='left'
          onClick={onUnpublish}
          title={t('styleguide/CommentActions/unpublish')}
        >
          <UnpublishIcon />
        </IconButton>
      )}
      <IconButton
        type='left'
        onClick={onShare}
        title={t('styleguide/CommentActions/share')}
      >
        <ShareIcon />
      </IconButton>
      {userCanReport && onReport && (
        <IconButton
          type='left'
          disabled={userReportedAt}
          onClick={handleReport}
          title={t('styleguide/CommentActions/report')}
        >
          <span>
            <ReportIcon
              {...colorScheme.set('fill', userReportedAt ? 'disabled' : 'text')}
            />
            {numReports > 0 && (
              <span {...styles.text} {...colorScheme.set('color', 'text')}>
                {numReports}
              </span>
            )}
          </span>
        </IconButton>
      )}
      <div {...styles.votes}>
        {!!(featuredText || actions.featureComment) && (
          <IconButton
            type='left'
            title={
              featuredAt
                ? t('styleguide/CommentActions/featured', {
                    date: dateFormat(new Date(featuredAt)),
                    time: hmFormat(new Date(featuredAt)),
                    text: featuredText
                  })
                : t('styleguide/CommentActions/feature')
            }
            onClick={
              actions.featureComment && (() => actions.featureComment(comment))
            }
          >
            <FeaturedIcon
              {...(featuredText && colorScheme.set('fill', 'primary'))}
            />
          </IconButton>
        )}
        <div {...styles.vote}>
          <IconButton
            type={userVote === 'UP' ? 'selectedVote' : 'vote'}
            onClick={onUpvote}
            title={t('styleguide/CommentActions/upvote')}
          >
            <MdKeyboardArrowUp />
          </IconButton>
          <span
            title={t.pluralize('styleguide/CommentActions/upvote/count', {
              count: upVotes
            })}
          >
            {upVotes}
          </span>
        </div>
        <div {...styles.voteDivider} {...colorScheme.set('color', 'text')}>
          /
        </div>
        <div {...styles.vote}>
          <span
            title={t.pluralize('styleguide/CommentActions/downvote/count', {
              count: downVotes
            })}
          >
            {downVotes}
          </span>
          <IconButton
            type={userVote === 'DOWN' ? 'selectedVote' : 'vote'}
            onClick={onDownvote}
            title={t('styleguide/CommentActions/downvote')}
          >
            <MdKeyboardArrowDown />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

const IconButton = ({ type, onClick, title, children }) => {
  const [colorScheme] = useColorContext()
  const iconButtonStyleRules = useMemo(() => {
    return {
      iconButton: css({
        color: colorScheme.getCSSColor('text'),
        '&[disabled]': {
          cursor: 'inherit',
          color: colorScheme.getCSSColor('disabled')
        }
      })
    }
  }, [colorScheme])
  return (
    <button
      {...merge(styles.iconButton, styles[`${type}Button`])}
      {...iconButtonStyleRules}
      title={title}
      disabled={!onClick}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
