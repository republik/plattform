import {
  DiscussionCommentsWrapper,
  Loader,
  pxToRem,
} from '@project-r/styleguide'
import FontSizeSync from 'components/FontSize/Sync'
import { css } from 'glamor'
import { useMemo } from 'react'
import { useTranslation } from '../../lib/withT'
import { useDiscussion } from './context/DiscussionContext'
import DiscussionCommentTreeRenderer from './DiscussionCommentTreeRenderer'
import DiscussionComposer from './DiscussionComposer/DiscussionComposer'
import DiscussionOptions from './DiscussionOptions/DiscussionOptions'
import TagFilter from './DiscussionOptions/TagFilter'
import createDiscussionForumPostingSchema from './helpers/createDiscussionForumPostingSchema'
import makeCommentTree from './helpers/makeCommentTree'
import useDiscussionFocusHelper from './hooks/useDiscussionFocusHelper'

const styles = {
  commentsWrapper: css({
    marginTop: pxToRem(20),
  }),
}

type Props = {
  documentMeta?: any
}

const Discussion = ({ documentMeta }: Props) => {
  const { t } = useTranslation()

  const {
    discussion,
    loading: discussionLoading,
    error: discussionError,
    fetchMore,
  } = useDiscussion()

  const { error: focusError } = useDiscussionFocusHelper()

  const comments = useMemo(() => {
    if (!discussion) {
      return {
        totalCount: 0,
        directTotalCount: 0,
        pageInfo: {},
        nodes: [],
      }
    }
    return makeCommentTree(discussion?.comments)
  }, [discussion])

  const structuredData = useMemo(() => {
    if (!discussion) return null
    return createDiscussionForumPostingSchema(discussion)
  }, [discussion])

  const loadMore = async (): Promise<unknown> => {
    if (!discussion) return
    const lastNode =
      discussion.comments.nodes[discussion.comments.nodes.length - 1]
    const endCursor = discussion.comments.pageInfo.endCursor
    await fetchMore({
      after: endCursor,
      appendAfter: lastNode.id,
    })
  }

  return (
    <Loader
      loading={discussionLoading}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      error={
        discussionError ||
        (!discussionLoading && !discussion
          ? t('discussion/missing')
          : undefined)
      }
      render={() => (
        <>
          {structuredData && (
            <script
              type='application/ld+json'
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData),
              }}
            />
          )}
          <FontSizeSync />
          <TagFilter discussion={discussion} />
          <DiscussionComposer
            isRoot
            placeholder={
              documentMeta?.discussionType === 'statements'
                ? t('components/Discussion/Statement/Placeholder')
                : undefined
            }
          />
          <div {...styles.commentsWrapper}>
            <DiscussionOptions documentMeta={documentMeta} />
            <DiscussionCommentsWrapper
              t={t}
              loadMore={loadMore}
              moreAvailableCount={
                comments.directTotalCount - comments.nodes.length
              }
              tagMappings={documentMeta?.tagMappings}
              errorMessage={focusError?.message}
            >
              <DiscussionCommentTreeRenderer comments={comments.nodes} />
            </DiscussionCommentsWrapper>
          </div>
        </>
      )}
    />
  )
}

export default Discussion
