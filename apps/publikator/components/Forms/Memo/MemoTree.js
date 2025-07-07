import {
  CommentComposer,
  CommentComposerPlaceholder,
  CommentNode,
  DiscussionContext,
} from '@project-r/styleguide'
import { IconEdit, IconUnpublish } from '@republik/icons'
import compose from 'lodash/flowRight'
import { useContext, useMemo, useState } from 'react'
import withMe from '../../../lib/withMe'
import { getDisplayAuthor, withMemos } from './graphql'

const MemoTree = (props) => {
  const {
    repoId,
    parentId,
    onPublished,
    publish,
    edit,
    unpublish,
    memos,
    me,
    t,
  } = props

  const discussionContext = useMemo(() => {
    return {
      t,
      discussion: {
        id: repoId,
        displayAuthor: getDisplayAuthor(me),
      },
      actions: {
        submitMemo: (parentId, text) =>
          publish(repoId, parentId, text).then(
            async (response) => {
              !!onPublished && (await onPublished(response.data.memo))
              return { ok: true }
            },
            (error) => ({ error }),
          ),
        editMemo: (id, text) =>
          edit(id, text).then(
            () => ({ ok: true }),
            (error) => ({ error }),
          ),
        unpublishMemo: (id) =>
          unpublish(id).then(
            () => ({ ok: true }),
            (error) => ({ error }),
          ),
      },
    }
  }, [repoId, me])

  // memos == ALL memos for a given repoId
  const rootMemo = memos?.nodes?.find((node) => node.id === parentId)

  return (
    <DiscussionContext.Provider value={discussionContext}>
      <MemoContainer memo={rootMemo} />
    </DiscussionContext.Provider>
  )
}

export default compose(withMe, withMemos)(MemoTree)

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
          icon: IconEdit,
          onClick: () => setIsEditing(true),
        },
        !!userCanEdit && {
          label: t('memo/container/unpublish'),
          icon: IconUnpublish,
          onClick: () => actions.unpublishMemo(memo.id),
          disabled: !published,
        },
      ].filter(Boolean),
    [userCanEdit, published],
  )

  if (!memo) {
    return <MemoComposer isRoot={true} onClose={setIsReplying} />
  }

  return (
    <CommentNode
      CommentLink={({ children }) => <>{children}</>}
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
        handleShare: undefined,
      }}
      userCanComment={true}
      menuItems={menuItems}
      editComposer={
        isEditing && <MemoComposer memo={memo} onClose={setIsEditing} />
      }
    >
      {isReplying && (
        <MemoComposer parentId={memo.id} onClose={setIsReplying} />
      )}
      {memo.comments.nodes.map((memo) => (
        <MemoContainer key={memo.id} memo={memo} />
      ))}
    </CommentNode>
  )
}

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
        parentId={parentId}
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
