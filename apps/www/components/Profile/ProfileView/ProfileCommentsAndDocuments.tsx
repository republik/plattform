import { useState } from 'react'
import { Scroller, TabButton } from '@project-r/styleguide'
import { useTranslation } from '../../../lib/withT'
import ProfileCommentsFeed from './ProfileCommentsFeed'
import ProifleDocumentsFeed from './ProifleDocumentsFeed'

export default function ProfileCommentsAndDocuments({
  isMe,
  user,
  loadMoreDocuments,
  loadMoreComments,
}) {
  const [activeChildIndex, setActiveChildIndex] = useState(0)
  const { t } = useTranslation()

  // only show tabs if user has documents (articles)
  if (!user.documents || !user.documents.totalCount) {
    return (
      <ProfileCommentsFeed
        isMe={isMe}
        user={user}
        comments={user.comments}
        loadMore={loadMoreComments}
        showTitle
      />
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Scroller activeChildIndex={activeChildIndex}>
          <TabButton
            text={t.pluralize('profile/documents/title', {
              count: user.documents.totalCount,
            })}
            isActive={activeChildIndex === 0}
            onClick={() => {
              setActiveChildIndex(0)
            }}
          />
          <TabButton
            text={t.pluralize('profile/comments/title', {
              count: user.comments.totalCount,
            })}
            isActive={activeChildIndex === 1}
            onClick={() => {
              setActiveChildIndex(1)
            }}
          />
        </Scroller>
      </div>
      {activeChildIndex === 0 ? (
        <ProifleDocumentsFeed
          documents={user.documents}
          loadMore={loadMoreDocuments}
        />
      ) : (
        <ProfileCommentsFeed
          isMe={isMe}
          user={user}
          comments={user.comments}
          loadMore={loadMoreComments}
        />
      )}
    </div>
  )
}
