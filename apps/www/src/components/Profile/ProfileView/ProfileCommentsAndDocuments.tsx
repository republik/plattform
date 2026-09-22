// The loader variant, not the server component: this page is pages-router, so
// there is nothing here that can await the first page.
import {
  ArticlesByContributorFeedClient,
} from '@/app/(sanity)/components/contributor/articles-feed/articles-by-contributor-feed-client'
import { useMe } from '@/lib/context/MeContext'
import { useTranslation } from '@/lib/withT'
import { IconButton, Scroller, TabButton, useColorContext } from '@project-r/styleguide'
import { IconReport } from '@republik/icons'
import { css } from 'glamor'
import { useState } from 'react'
import { useReportUserMutation } from '../graphql/useReportUserMutation'
import ProfileCommentsFeed from './ProfileCommentsFeed'

const styles = {
  tabsContainer: css({
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'space-between',
  }),
  tabFiller: css({
    flex: 1,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  }),
}

export default function ProfileCommentsAndDocuments({
  isMe,
  user,
  loadMoreComments,
  articleCount,
}) {
  const [colorScheme] = useColorContext()
  const { me } = useMe()
  const [activeChildIndex, setActiveChildIndex] = useState(0)
  const [reportUserMutation] = useReportUserMutation()
  const { t } = useTranslation()

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

  // if user is not logged in, show only documents, if applicable
  if (!me) {
    return <ArticlesByContributorFeedClient userId={user.id} />
  }

  // only show documents and tabs if user has documents (articles)
  // else only show comments feed. While the count is still in flight the
  // comments feed alone is shown, so the tabs appear once rather than flicker.
  if (!articleCount) {
    return (
      <ProfileCommentsFeed
        comments={user.comments}
        loadMore={loadMoreComments}
        showTitle
      />
    )
  }

  return (
    <div>
      <div {...styles.tabsContainer}>
        <Scroller activeChildIndex={activeChildIndex}>
          <TabButton
            text={t.pluralize('profile/documents/title', {
              count: articleCount,
            })}
            isActive={activeChildIndex === 0}
            onClick={() => {
              setActiveChildIndex(0)
            }}
          />
          {me && (
            <TabButton
              text={t.pluralize('profile/comments/title', {
                count: user.comments.totalCount,
              })}
              isActive={activeChildIndex === 1}
              onClick={() => {
                setActiveChildIndex(1)
              }}
            />
          )}
        </Scroller>
        <div
          {...colorScheme.set('borderColor', 'divider')}
          {...styles.tabFiller}
        >
          {!!user.hasPublicProfile && !articleCount && !isMe && (
            <IconButton
              Icon={IconReport}
              title={t('profile/report/label')}
              onClick={() => reportUser()}
            />
          )}
        </div>
      </div>
      {activeChildIndex === 0 ? (
        <ArticlesByContributorFeedClient userId={user.id} />
      ) : (
        <ProfileCommentsFeed
          comments={user.comments}
          loadMore={loadMoreComments}
        />
      )}
    </div>
  )
}
