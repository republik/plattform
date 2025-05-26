import { CommentTeaser, Interaction } from '@project-r/styleguide'
import { useTranslation } from '../../../lib/withT'
import CommentLink from '../../Discussion/shared/CommentLink'
import InfiniteScroll from '../../Frame/InfiniteScroll'
import { css } from 'glamor'

const styles = {
  noBorder: css({
    '& div:nth-child(2)': {
      border: 'none',
    },
  }),
}

const ProfileCommentsFeed = ({ comments, loadMore, showTitle = false }) => {
  const { t } = useTranslation()

  if (!comments || !comments.totalCount) {
    return null
  }

  const hasMore = comments.pageInfo && comments.pageInfo.hasNextPage
  const totalCount = comments.totalCount
  const currentCount = comments.nodes.length

  return (
    <InfiniteScroll
      hasMore={hasMore}
      loadMore={loadMore}
      totalCount={totalCount}
      currentCount={currentCount}
      loadMoreKey={'feed/loadMore/comments'}
      customStyles={styles.noBorder}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: showTitle ? 'space-between' : 'flex-end',
          marginBottom: !showTitle && 16,
        }}
      >
        {showTitle && (
          <Interaction.H3 style={{ marginBottom: 20 }}>
            {t.pluralize('profile/comments/title', {
              count: totalCount,
            })}
          </Interaction.H3>
        )}
      </div>
      {comments.nodes
        .filter((comment) => comment.preview)
        .map((comment) => {
          const discussion = comment.discussion || {}
          const context = {
            title: discussion.title,
          }
          return (
            <CommentTeaser
              key={comment.id}
              id={comment.id}
              context={context}
              preview={
                !comment.published
                  ? {
                      string:
                        t('styleguide/comment/unpublished') +
                        (comment.adminUnpublished
                          ? ' ' + t('styleguide/comment/adminUnpublished')
                          : ''),
                      more: false,
                    }
                  : comment.preview
              }
              createdAt={comment.createdAt}
              tags={comment.tags}
              parentIds={comment.parentIds}
              discussion={discussion}
              CommentLink={CommentLink}
              t={t}
            />
          )
        })}
    </InfiniteScroll>
  )
}

export default ProfileCommentsFeed
