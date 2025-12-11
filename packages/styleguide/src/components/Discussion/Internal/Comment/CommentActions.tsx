import { css } from 'glamor'
import { Reply, Share } from 'lucide-react'
import PropTypes from 'prop-types'
import React, { useMemo } from 'react'
import { useCurrentMinute } from '../../../../lib/useCurrentMinute'
import { useMediaQuery } from '../../../../lib/useMediaQuery'
import { mUp } from '../../../../theme/mediaQueries'
import IconButton from '../../../IconButton/discussion-button'
import { formatTimeRelative } from '../../DiscussionContext'
import { ClapButton } from './ClapButton'
import { ReportButton } from './ReportButton'

const styles = {
  container: css({
    display: 'flex',
    alignItems: 'center',
    height: 40,
  }),
}

const propTypes = {
  t: PropTypes.func.isRequired,
  comment: PropTypes.object.isRequired,
  actions: PropTypes.shape({
    handleLoadReplies: PropTypes.func,
    handleReply: PropTypes.func,
    handleShare: PropTypes.func,
    handleEdit: PropTypes.func,
    handleReport: PropTypes.func,
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
  actions: { handleReply, handleShare, handleReport },
  voteActions,
  userCanComment,
  userWaitUntil,
}) => {
  const isDesktop = useMediaQuery(mUp)

  const now = useCurrentMinute()

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
    <div {...styles.container}>
      {voteActions && comment?.published && (
        <ClapButton
          t={t}
          comment={comment}
          disabled={!userCanComment}
          handleUpVote={voteActions.handleUpVote}
          handleUnVote={voteActions.handleUnVote}
        />
      )}
      {handleReply && (
        <IconButton
          disabled={!!replyBlockedMessage}
          onClick={handleReply}
          Icon={Reply}
          strokeWidth={1.25}
          title={replyBlockedMessage || t('styleguide/CommentActions/answer')}
          label={t('styleguide/CommentActions/answer')}
          labelShort={t('styleguide/CommentActions/answer')}
        />
      )}
      {handleShare && comment?.published && (
        <IconButton
          title={t('styleguide/CommentActions/share')}
          Icon={Share}
          onClick={() => handleShare(comment)}
          size={16}
        />
      )}
      {handleReport && comment?.userCanReport && (
        <ReportButton t={t} comment={comment} handleReport={handleReport} />
      )}
    </div>
  )
}

CommentActions.propTypes = propTypes
