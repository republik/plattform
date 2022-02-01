import React, { useMemo, useState, useContext } from 'react'
import {
  UnpublishIcon,
  EditIcon,
  DiscussionContext,
  CommentNode,
  CommentComposer,
  CommentComposerPlaceholder
} from '@project-r/styleguide'

const MemoComposer = ({ isRoot = false, parentId, memo, onClose }) => {
  const [isActive, setIsActive] = useState(!isRoot)
  const { t, discussion, actions } = useContext(DiscussionContext)

  const { displayAuthor } = discussion

  const onSubmitLabel =
    (!!memo && t('memo/container/composer/edit')) ||
    (!!parentId && t('memo/container/composer/answer')) ||
    t('memo/container/composer/submit')

  if (isActive) {
    return (
      <CommentComposer
        t={t}
        isRoot={isRoot}
        discussionId={discussion.id}
        commentId={memo?.id}
        onSubmit={({ text }) => {
          if (!memo) {
            return actions.submitMemo(parentId, text)
          }

          return actions.editMemo(memo.id, text)
        }}
        onSubmitLabel={onSubmitLabel}
        onClose={() => {
          onClose && onClose()
          setIsActive(false)
        }}
        displayAuthor={displayAuthor}
        placeholder={t('memo/container/composer/placeholder')}
        initialText={memo?.text}
      />
    )
  }

  if (!parentId) {
    return (
      <CommentComposerPlaceholder
        t={t}
        displayAuthor={displayAuthor}
        onClick={() => {
          setIsActive(true)
        }}
        placeholder={t('memo/container/composer/placeholder')}
      />
    )
  }

  return <p>Nothing!</p>
}

const MemoContainer = ({ memo }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const { t, actions } = useContext(DiscussionContext)

  const { userCanEdit, published } = memo || {}

  const menuItems = useMemo(
    () =>
      [
        !!userCanEdit && {
          label: t('memo/container/edit'),
          icon: EditIcon,
          onClick: () => setIsEditing(true)
        },
        !!userCanEdit && {
          label: t('memo/container/unpublish'),
          icon: UnpublishIcon,
          onClick: () => actions.unpublishMemo(memo.id),
          disabled: !published
        }
      ].filter(Boolean),
    [userCanEdit, published]
  )

  if (!memo) {
    return <MemoComposer isRoot={true} onClose={setIsReplying} />
  }

  return (
    <CommentNode
      t={t}
      comment={memo}
      actions={{
        handleUpVote: undefined,
        handleDownVote: undefined,
        handleUnVote: undefined,
        handleReply: () => {
          setIsReplying(true)
        },
        handleLoadReplies: undefined,
        handleShare: undefined
      }}
      menuItems={menuItems}
      editComposer={
        isEditing && <MemoComposer memo={memo} onClose={setIsEditing} />
      }
    >
      {isReplying && (
        <MemoComposer parentId={memo.id} onClose={setIsReplying} />
      )}
      {memo.comments.nodes.map(memo => (
        <MemoContainer key={memo.id} memo={memo} />
      ))}
    </CommentNode>
  )
}

export default MemoContainer
