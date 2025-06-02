import { useState } from 'react'
import { css } from 'glamor'
import {
  Scroller,
  TabButton,
  IconButton,
  useColorContext,
} from '@project-r/styleguide'
import { useTranslation } from '../../../lib/withT'
import { useMe } from '../../../lib/context/MeContext'
import ProfileCommentsFeed from './ProfileCommentsFeed'
import ProifleDocumentsFeed from './ProifleDocumentsFeed'
import { IconReport } from '@republik/icons'
import { useReportUserMutation } from '../graphql/useReportUserMutation'

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
  loadMoreDocuments,
  loadMoreComments,
}) {
  const [colorScheme] = useColorContext()
  const [activeChildIndex, setActiveChildIndex] = useState(0)
  const [reportUserMutation] = useReportUserMutation()
  const { t } = useTranslation()
  const { me } = useMe()

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
    return (
      <ProifleDocumentsFeed
        documents={user.documents}
        loadMore={loadMoreDocuments}
        showTitle
      />
    )
  }

  // only show documents and tabs if user has documents (articles)
  // else only show comments feed
  if (!user.documents || !user.documents.totalCount) {
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
              count: user.documents.totalCount,
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
          {!!user.hasPublicProfile && !isMe && (
            <IconButton
              Icon={IconReport}
              title={t('profile/report/label')}
              onClick={() => reportUser()}
            />
          )}
        </div>
      </div>
      {activeChildIndex === 0 ? (
        <ProifleDocumentsFeed
          documents={user.documents}
          loadMore={loadMoreDocuments}
        />
      ) : (
        <ProfileCommentsFeed
          comments={user.comments}
          loadMore={loadMoreComments}
        />
      )}
    </div>
  )
}
