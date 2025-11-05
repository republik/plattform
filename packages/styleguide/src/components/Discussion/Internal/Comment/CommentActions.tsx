import React, { useMemo } from 'react'
import { css } from 'glamor'
import { sansSerifMedium14 } from '../../../Typography/styles'
import { formatTimeRelative } from '../../DiscussionContext'
import { useColorContext } from '../../../Colors/ColorContext'
import { useCurrentMinute } from '../../../../lib/useCurrentMinute'
import IconButton from '../../../IconButton'
import { VoteButtons } from './VoteButtons'
import PropTypes from 'prop-types'
import { useMediaQuery } from '../../../../lib/useMediaQuery'
import { mUp } from '../../../../theme/mediaQueries'
import { IconDiscussion, IconReply, IconShare } from '@republik/icons'

const styles = {
  root: css({
    ...sansSerifMedium14,
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    marginLeft: '-7px',
  }),
  leftActionsWrapper: css({
    display: 'inline-flex',
    marginLeft: 7,
    flexDirection: 'row',
    '& > button:not(:last-child)': {
      marginRight: 14,
    },
  }),
}

const propTypes = {
  t: PropTypes.func.isRequired,
  comment: PropTypes.object.isRequired,
  actions: PropTypes.shape({
    handleLoadReplies: PropTypes.func,
    handleReply: PropTypes.func,
    handleShare: PropTypes.func,
  }),
  voteActions: PropTypes.shape({
    handleUpVote: PropTypes.func.isRequired,
    handleDownVote: PropTypes.func.isRequired,
    handleUnVote: PropTypes.func.isRequired,
  }),
  userCanComment: PropTypes.bool,
  userWaitUntil: PropTypes.string,
}

export const CommentActions = ({
  t,
  comment,
  actions: { handleLoadReplies, handleReply, handleShare },
  voteActions,
  userCanComment,
  userWaitUntil,
}) => {
  const isDesktop = useMediaQuery(mUp)

  const now = useCurrentMinute()
  const [colorScheme] = useColorContext()

  const replyBlockedMessage = useMemo<string | null>(() => {
    const waitUntilDate = userWaitUntil && new Date(userWaitUntil)
    if (waitUntilDate && waitUntilDate.getTime() > now) {
      return t('styleguide/CommentComposer/wait', {
        time: formatTimeRelative(waitUntilDate, { isDesktop, t, now }),
      }) as string
    }
    return null
  }, [userWaitUntil, now, isDesktop, t])

  return (
    <div {...styles.root} {...colorScheme.set('color', 'text')}>
      <div {...styles.leftActionsWrapper}>
        {handleShare && comment?.published && (
          <IconButton
            title={t('styleguide/CommentActions/share')}
            Icon={IconShare}
            onClick={() => handleShare(comment)}
            size={20}
          />
        )}
        {handleReply && (
          <IconButton
            disabled={!!replyBlockedMessage}
            onClick={handleReply}
            Icon={IconReply}
            size={20}
            title={replyBlockedMessage || t('styleguide/CommentActions/answer')}
            label={t('styleguide/CommentActions/answer')}
            labelShort={t('styleguide/CommentActions/answer')}
          />
        )}
      </div>
      {voteActions && comment?.published && (
        <VoteButtons
          t={t}
          comment={comment}
          disabled={!userCanComment}
          handleUpVote={voteActions.handleUpVote}
          handleDownVote={voteActions.handleDownVote}
          handleUnVote={voteActions.handleUnVote}
        />
      )}
    </div>
  )
}

CommentActions.propTypes = propTypes
