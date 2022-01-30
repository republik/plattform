import React, { useMemo } from 'react'
import { compose } from 'react-apollo'

import { DiscussionContext } from '@project-r/styleguide'

import withT from '../../../../lib/withT'
import withMe from '../../../../lib/withMe'

import { withMemos, getDisplayAuthor } from './graphql'
import MemoContainer from './MemoContainer'

const MemoTree = props => {
  const {
    repoId,
    parentId,
    publish,
    onPublished,
    edit,
    unpublish,
    memos,
    me,
    t
  } = props

  const discussionContext = useMemo(() => {
    return {
      t,
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
        submitMemo: (parentId, text) =>
          publish(repoId, parentId, text).then(
            async response => {
              !!onPublished && (await onPublished(response.data.memo))
              return { ok: true }
            },
            error => ({ error })
          ),
        editMemo: (memoId, text) =>
          edit(memoId, text).then(
            () => ({ ok: true }),
            error => ({ error })
          ),
        unpublishMemo: memoId =>
          unpublish(memoId).then(
            () => ({ ok: true }),
            error => ({ error })
          )
      }
    }
  }, [repoId, onPublished, me])

  // memos == ALL memos for a given repoId
  const rootMemo = memos?.nodes?.find(node => node.id === parentId)

  return (
    <DiscussionContext.Provider value={discussionContext}>
      <MemoContainer t={t} memo={rootMemo} />
    </DiscussionContext.Provider>
  )
}

export default compose(withT, withMe, withMemos)(MemoTree)
