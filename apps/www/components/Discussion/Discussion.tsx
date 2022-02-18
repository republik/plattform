import React, { useMemo } from 'react'
import {
  Loader,
  DiscussionCommentsWrapper,
  pxToRem,
} from '@project-r/styleguide'
import { useTranslation } from '../../lib/withT'
import { useDiscussion } from './context/DiscussionContext'
import DiscussionComposer from './DiscussionComposer/DiscussionComposer'
import DiscussionCommentTreeRenderer from './DiscussionCommentTreeRenderer'
import DiscussionOptions from './DiscussionOptions/DiscussionOptions'
import TagFilter from './DiscussionOptions/TagFilter'
import makeCommentTree from './helpers/makeCommentTree'
import { css } from 'glamor'
import useDiscussionFocusHelper from './hooks/useDiscussionFocusHelper'

const styles = {
  commentsWrapper: css({
    marginTop: pxToRem(20),
  }),
}

type Props = {
  showPayNotes?: boolean
  inRootCommentOverlay?: boolean
  documentMeta?: any
}

const Discussion = ({
  documentMeta,
  inRootCommentOverlay,
  showPayNotes,
}: Props) => {
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
          {!inRootCommentOverlay && (
            <>
              <TagFilter discussion={discussion} />
              <DiscussionComposer
                isRoot
                placeholder={
                  documentMeta?.discussionType === 'statements'
                    ? t('components/Discussion/Statement/Placeholder')
                    : undefined
                }
                showPayNotes={showPayNotes}
              />
            </>
          )}
          <div {...styles.commentsWrapper}>
            {!inRootCommentOverlay && (
              <DiscussionOptions documentMeta={documentMeta} />
            )}
            <DiscussionCommentsWrapper
              t={t}
              loadMore={loadMore}
              moreAvailableCount={
                comments.directTotalCount - comments.nodes.length
              }
              tagMappings={documentMeta?.tagMappings}
              errorMessage={focusError?.message}
            >
              <DiscussionCommentTreeRenderer
                comments={comments.nodes}
                discussion={discussion}
                inRootCommentOverlay={inRootCommentOverlay}
                documentMeta={documentMeta}
              />
            </DiscussionCommentsWrapper>
          </div>
        </>
      )}
    />
  )
}

export default Discussion
