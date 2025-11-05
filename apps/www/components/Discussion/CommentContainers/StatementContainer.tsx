import { ReactElement, useMemo, useState } from 'react'
import { StatementNode } from '@project-r/styleguide'
import Link from 'next/link'
import { useDiscussion } from '../context/DiscussionContext'
import { useTranslation } from '../../../lib/withT'
import { useMe } from '../../../lib/context/MeContext'
import CommentLink, { getFocusHref } from '../shared/CommentLink'
import { format } from 'url'
import useVoteCommentHandlers from '../hooks/actions/useVoteCommentHandlers'
import useUnpublishCommentHandler from '../hooks/actions/useUnpublishCommentHandler'
import useReportCommentHandler from '../hooks/actions/useReportCommentHandler'
import { CommentFragmentType } from '../graphql/fragments/CommentFragment.graphql'
import DiscussionComposer from '../DiscussionComposer/DiscussionComposer'
import getCommentActions from './getCommentActions'
import { useLocalCommentReports } from '../helpers/useLocalCommentReports'

type Props = {
  comment: CommentFragmentType
  tagMappings: any
}

const StatementContainer = ({ comment, tagMappings }: Props): ReactElement => {
  const [editMode, setEditMode] = useState(false)

  const { t } = useTranslation()
  const { me } = useMe()

  const {
    discussion,
    overlays: { shareOverlay },
  } = useDiscussion()
  const { shareHandler } = shareOverlay
  const { upVoteCommentHandler, downVoteCommentHandler, unVoteCommentHandler } =
    useVoteCommentHandlers()
  const unpublishCommentHandler = useUnpublishCommentHandler()
  const reportCommentHandler = useReportCommentHandler()

  const { checkIfAlreadyReported } = useLocalCommentReports()

  const menuItems = useMemo(() => {
    return getCommentActions({
      comment,
      actions: {
        unpublishCommentHandler,
        reportCommentHandler,
      },
      roles: me?.roles ?? [],
      t,
      setEditMode,
      checkIfAlreadyReported,
    })
  }, [
    comment,
    me?.roles,
    t,
    unpublishCommentHandler,
    reportCommentHandler,
    checkIfAlreadyReported,
  ])

  const isFocused = useMemo(() => {
    const focusedComment = discussion?.comments?.focus ?? null
    return focusedComment && focusedComment.id === comment.id
  }, [discussion?.comments, comment])

  if (editMode) {
    return (
      <DiscussionComposer
        isRoot
        onClose={() => setEditMode(false)}
        commentId={comment.id}
        initialText={comment.text}
        initialTagValue={comment?.tags?.[0]}
        placeholder={t('components/Discussion/Statement/Placeholder')}
      />
    )
  }

  return (
    <StatementNode
      comment={comment}
      t={t}
      actions={{
        handleShare: shareHandler,
      }}
      voteActions={{
        handleUpVote: upVoteCommentHandler,
        handleDownVote: downVoteCommentHandler,
        handleUnVote: unVoteCommentHandler,
      }}
      menuItems={menuItems}
      tagMappings={tagMappings}
      isHighlighted={isFocused}
      disableVoting={!discussion.userCanComment}
      CommentLink={CommentLink}
    />
  )
}

export default StatementContainer
