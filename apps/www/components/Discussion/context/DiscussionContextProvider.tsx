import { FC, ReactNode } from 'react'
import { GENERAL_FEEDBACK_DISCUSSION_ID } from '../../../lib/constants'
import { useRouter } from 'next/router'
import useDiscussionData from '../hooks/useDiscussionData'
import useOverlay from '../hooks/overlays/useOverlay'
import DiscussionOverlays from './components/DiscussionOverlays'
import DiscussionContext, { DiscussionContextValue } from './DiscussionContext'
import DiscussionMetaHelper from './components/DiscussionMetaHelper'
import useDiscussionNotificationHelper from '../hooks/useDiscussionNotificationHelper'
import useShareCommentOverlay from '../hooks/overlays/useShareCommentOverlay'
import { DiscussionCredential } from '../graphql/types/SharedTypes'
import { CommentFragmentType } from '../graphql/fragments/CommentFragment.graphql'

/**
 * Wrapper component that provides the discussion data it's children.
 * It also handles logic for focusing on comments and displaying rendering of overlays.
 * @constructor
 */
const DiscussionContextProvider: FC<{
  children?: ReactNode
  discussionPath: string
  isBoardRoot?: boolean
  parentId?: string
  includeParent?: boolean
}> = ({ children, discussionPath, isBoardRoot, parentId, includeParent }) => {
  const { query } = useRouter()
  const orderBy = query.order as string || 'AUTO'

  const activeTag = query.tag as string
  const focusId = query.focus as string

  const depth = isBoardRoot ? 1 : 3

  const { discussion, error, loading, refetch, fetchMore } = useDiscussionData(
    discussionPath,
    {
      orderBy,
      activeTag,
      depth,
      focusId,
      parentId,
      includeParent,
    },
  )

  useDiscussionNotificationHelper(discussion)

  // Create overlay state that is meant to be accessed by all discussion-components

  const shareOverlay = useShareCommentOverlay(discussion)

  const preferencesOverlay = useOverlay<DiscussionCredential>()
  const featureOverlay = useOverlay<CommentFragmentType>()

  const contextValue: DiscussionContextValue = {
    id: discussion?.id,
    discussion,
    loading: loading,
    error: error,
    fetchMore,
    refetch,
    focusId,
    orderBy,
    activeTag,
    depth,
    overlays: {
      shareOverlay,
      preferencesOverlay,
      featureOverlay,
    },
  }

  return (
    <DiscussionContext.Provider value={contextValue}>
      <div data-discussion-id={discussion?.id}>
        {children}
        {discussion && (
          <>
            <DiscussionOverlays isBoardRoot={isBoardRoot} />
            <DiscussionMetaHelper
              parentId={parentId}
              includeParent={includeParent}
            />
          </>
        )}
      </div>
    </DiscussionContext.Provider>
  )
}

export default DiscussionContextProvider
