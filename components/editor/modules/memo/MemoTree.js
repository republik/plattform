import React, { useState } from 'react'
import { compose } from 'react-apollo'

import {
  DiscussionContext,
  CommentComposer,
  CommentComposerPlaceholder,
  CommentList
} from '@project-r/styleguide'

import withT from '../../../../lib/withT'
import withMe from '../../../../lib/withMe'
import { withMemos, getDisplayAuthor } from './graphql'

const buildDiscussionContext = ({
  me,
  repoId,
  onPublished,
  onEdited,
  onUnpublished,
  publish,
  edit,
  unpublish,
  t
}) => ({
  discussion: {
    id: repoId,
    displayAuthor: getDisplayAuthor(me),
    rules: {
      maxLength: null,
      minInterval: null,
      disableTopLevelComments: false,
      anonymity: 'FORBIDDEN'
    }
  },
  actions: {
    previewComment: ({ content, discussionId, parentId, id }) => {
      console.log('previewComment', {
        content,
        discussionId,
        parentId,
        id
      })
    },
    submitComment: async (parentComment, text) =>
      publish(repoId, parentComment?.id, text).then(
        async response => {
          !!onPublished && (await onPublished(response.data.memo))
          return { ok: true }
        },
        error => ({ error })
      ),
    editComment: (comment, text) =>
      edit(comment.id, text).then(
        async response => {
          !!onEdited && (await onEdited(response.data.memo))
          return { ok: true }
        },
        error => ({ error })
      ),
    unpublishComment: comment =>
      unpublish(comment.id).then(
        async response => {
          !!onUnpublished && (await onUnpublished(response.data.memo))
          return { ok: true }
        },
        error => ({ error })
      ),
    fetchMoreComments: ({ parentId, after, appendAfter }) => {
      console.log('fetchMoreComments', { parentId, after, appendAfter })
    },
    shareComment: comment => {
      console.log('shareComment', comment)
    },
    openDiscussionPreferences: () => {
      console.log('openDiscussionPreferences')
    },
    featureComment: false // () => {},
  },
  clock: {
    isDesktop: true,
    t
  },
  Link: ({ children }) => children
})

const MemoTree = props => {
  const { parentId, memos, me, t } = props
  const [isActive, setIsActive] = useState(false)

  if (!parentId && !isActive) {
    return (
      <CommentComposerPlaceholder
        t={t}
        displayAuthor={getDisplayAuthor(me)}
        onClick={() => {
          setIsActive(true)
        }}
      />
    )
  }

  const rootMemo = memos?.nodes?.find(node => node.id === parentId)
  const discussionContextValue = buildDiscussionContext(props)

  return (
    <>
      <DiscussionContext.Provider value={discussionContextValue}>
        {!rootMemo && (
          <CommentComposer
            t={t}
            isRoot
            onClose={() => {
              setIsActive(false)
            }}
            onSubmit={({ text }) =>
              discussionContextValue.actions.submitComment(null, text)
            }
          />
        )}
        {!!rootMemo && <CommentList comments={{ nodes: [rootMemo] }} t={t} />}
      </DiscussionContext.Provider>
    </>
  )
}

export default compose(withT, withMe, withMemos)(MemoTree)
