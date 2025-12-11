import {
  CommentNode,
  CommentProps,
  readDiscussionCommentDraft,
} from '@project-r/styleguide'
import * as React from 'react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { useMe } from '../../../lib/context/MeContext'
import { useTranslation } from '../../../lib/withT'
import { useDiscussion } from '../context/DiscussionContext'
import DiscussionComposer from '../DiscussionComposer/DiscussionComposer'
import { CommentTreeNode } from '../helpers/makeCommentTree'
import useReportCommentHandler from '../hooks/actions/useReportCommentHandler'
import useUnpublishCommentHandler from '../hooks/actions/useUnpublishCommentHandler'
import useVoteCommentHandlers from '../hooks/actions/useVoteCommentHandlers'
import CommentLink from '../shared/CommentLink'
import getCommentMenuItems from './getCommentActions'

type Props = {
  CommentComponent?: React.ElementType<CommentProps>
  comment: CommentTreeNode
  isLast?: boolean
}

const CommentContainer = ({
  CommentComponent = CommentNode,
  comment,
  isLast,
}: Props): ReactElement => {
  const { t } = useTranslation()
  const { me } = useMe()
  const {
    id: discussionId,
    discussion,
    fetchMore,
    overlays: { shareOverlay, featureOverlay },
  } = useDiscussion()

  const parentId = comment.id
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  useEffect(() => {
    const draft = parentId && readDiscussionCommentDraft(discussionId, parentId)
    if (draft) {
      setIsReplying(true)
    }
  }, [discussionId, parentId])

  // Handlers
  const voteHandlers = useVoteCommentHandlers()
  const reportCommentHandler = useReportCommentHandler()
  const unpublishCommentHandler = useUnpublishCommentHandler()

  const menuItems = useMemo(
    () =>
      getCommentMenuItems({
        t,
        comment,
        roles: me?.roles ?? [],
        actions: {
          setEditMode: setIsEditing,
          unpublishCommentHandler,
          featureCommentHandler: featureOverlay.handleOpen,
        },
      }),
    [
      t,
      comment,
      setIsEditing,
      me?.roles,
      unpublishCommentHandler,
      featureOverlay.handleOpen,
    ],
  )

  const loadRemainingAfter = discussion?.comments?.pageInfo?.endCursor
  const loadRemainingReplies = useCallback(() => {
    return fetchMore({
      discussionPath: discussion?.path,
      parentId,
      after: loadRemainingAfter,
    })
  }, [discussion, parentId, loadRemainingAfter, fetchMore])

  return (
    <CommentComponent
      t={t}
      comment={comment}
      CommentLink={CommentLink}
      actions={{
        handleReply: discussion.userCanComment
          ? () => setIsReplying(true)
          : undefined,
        handleLoadReplies: loadRemainingReplies,
        handleShare: shareOverlay.shareHandler,
        handleReport: reportCommentHandler,
      }}
      voteActions={{
        handleUpVote: voteHandlers.upVoteCommentHandler,
        handleDownVote: voteHandlers.downVoteCommentHandler,
        handleUnVote: voteHandlers.unVoteCommentHandler,
      }}
      menuItems={menuItems}
      userCanComment={discussion?.userCanComment}
      userWaitUntil={discussion?.userWaitUntil}
      editComposer={
        comment?.userCanEdit &&
        isEditing && (
          <DiscussionComposer
            onClose={() => setIsEditing(false)}
            isRoot={comment.parentIds.length === 0}
            commentId={comment.id}
            initialText={comment.text}
            initialTagValue={comment?.tags?.[0]}
          />
        )
      }
      focusId={discussion?.comments?.focus?.id}
      isLast={isLast}
    >
      {discussion?.userCanComment && isReplying && (
        <DiscussionComposer
          onClose={() => setIsReplying(false)}
          parentId={parentId}
          initialActiveState
        />
      )}
      {comment.comments.nodes.map((reply, index) => (
        <CommentContainer
          key={reply.id}
          comment={reply}
          isLast={index === comment.comments.nodes.length - 1}
        />
      ))}
    </CommentComponent>
  )
}

export default CommentContainer
