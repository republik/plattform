import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  CommentNode,
  CommentProps,
  readDiscussionCommentDraft,
} from '@project-r/styleguide'
import { useTranslation } from '../../../lib/withT'
import CommentLink, { getFocusHref } from '../shared/CommentLink'
import { useDiscussion } from '../context/DiscussionContext'
import useVoteCommentHandlers from '../hooks/actions/useVoteCommentHandlers'
import { CommentTreeNode } from '../helpers/makeCommentTree'
import getCommentMenuItems from './getCommentActions'
import { useMe } from '../../../lib/context/MeContext'
import useReportCommentHandler from '../hooks/actions/useReportCommentHandler'
import useUnpublishCommentHandler from '../hooks/actions/useUnpublishCommentHandler'
import DiscussionComposer from '../DiscussionComposer/DiscussionComposer'
import { useRouter } from 'next/router'

type Props = {
  CommentComponent?: React.ElementType<CommentProps>
  comment: CommentTreeNode
  isLast?: boolean
  isBoard?: boolean
  inRootCommentOverlay?: boolean
}

const CommentContainer = ({
  CommentComponent = CommentNode,
  comment,
  isLast,
  isBoard,
  inRootCommentOverlay,
}: Props): ReactElement => {
  const { t } = useTranslation()
  const { me } = useMe()
  const router = useRouter()
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
        setEditMode: setIsEditing,
        roles: me?.roles ?? [],
        actions: {
          reportCommentHandler,
          unpublishCommentHandler,
          featureCommentHandler: featureOverlay.handleOpen,
        },
      }),
    [
      t,
      comment,
      setIsEditing,
      me?.roles,
      reportCommentHandler,
      unpublishCommentHandler,
      featureOverlay.handleOpen,
    ],
  )

  const loadRemainingAfter = discussion?.comments?.pageInfo?.endCursor
  const loadRemainingReplies = useCallback(() => {
    if (isBoard && parentId) {
      const href = getFocusHref(discussion)
      if (href) {
        href.query.parent = parentId
        return router.push(href)
      }
    }
    return fetchMore({
      discussionId,
      parentId,
      after: loadRemainingAfter,
    })
  }, [discussionId, parentId, loadRemainingAfter, fetchMore, isBoard])

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
      inRootCommentOverlay={inRootCommentOverlay}
    >
      {discussion?.userCanComment && isReplying && (
        <DiscussionComposer
          onClose={() => setIsReplying(false)}
          parentId={parentId}
          initialActiveState
        />
      )}
      {!isBoard &&
        comment.comments.nodes.map((reply, index) => (
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
