import { CommentTeaser, Interaction, IconButton } from '@project-r/styleguide'
import { useTranslation } from '../../../lib/withT'
import CommentLink from '../../Discussion/shared/CommentLink'
import InfiniteScroll from '../../Frame/InfiniteScroll'
import { IconReport } from '@republik/icons'
import { useReportUserMutation } from '../graphql/useReportUserMutation'
import { css } from 'glamor'

const styles = {
  noBorder: css({
    '& div:nth-child(2)': {
      border: 'none',
    },
  }),
}

const ProfileCommentsFeed = ({
  comments,
  loadMore,
  user,
  isMe,
  showTitle = false,
}) => {
  const { t } = useTranslation()
  const [reportUserMutation] = useReportUserMutation()

  if (!comments || !comments.totalCount) {
    return null
  }

  const hasMore = comments.pageInfo && comments.pageInfo.hasNextPage
  const totalCount = comments.totalCount
  const currentCount = comments.nodes.length

  const reportUser = async () => {
    const reportReason = window.prompt(t('profile/report/confirm'))
    if (reportReason === null) {
      return
    }
    if (reportReason.length === 0) {
      alert(t('profile/report/provideReason'))
      return
    }
    const maxLength = 500
    if (reportReason.length > maxLength) {
      alert(
        t('profile/report/tooLong', {
          max: maxLength,
          input: reportReason.slice(0, maxLength) + '…',
          br: '\n',
        }),
      )
      return
    }

    try {
      await reportUserMutation({
        variables: {
          userId: user.id,
          reason: reportReason,
        },
      })
      alert(t('profile/report/success'))
    } catch (e) {
      console.warn(e)
      alert(t('profile/report/error'))
    }
  }

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
              count: comments.totalCount,
            })}
          </Interaction.H3>
        )}
        {!!user.hasPublicProfile && !isMe && (
          <IconButton
            Icon={IconReport}
            title={t('profile/report/label')}
            onClick={() => reportUser(user.id)}
          />
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
