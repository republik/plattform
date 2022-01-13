import React from 'react'
import { DiscussionContext } from '../DiscussionContext'
import { LoadMore } from './LoadMore'
import CommentNode from './CommentNode'

export const CommentList = ({
  t,
  parentId = null,
  comments,
  board = false,
  rootCommentOverlay = false
}) => {
  const { actions, discussion } = React.useContext(DiscussionContext)

  const { nodes = [], totalCount = 0, pageInfo } = comments
  const { endCursor } = pageInfo || {}
  const lastNode = nodes[nodes.length - 1]

  const loadMore = React.useCallback(() => {
    const appendAfter = lastNode ? lastNode.id : undefined
    actions.fetchMoreComments({ parentId, after: endCursor, appendAfter })
  }, [parentId, endCursor, lastNode, actions])

  const numMoreComments = (() => {
    const countComments = ({ totalCount = 0 } = {}) => totalCount
    const availableCount = nodes.reduce(
      (a, { comments }) => a + 1 + countComments(comments),
      0
    )
    return totalCount - availableCount
  })()

  return (
    <>
      {nodes.map((comment, i) => (
        <CommentNode
          key={comment.id}
          t={t}
          comment={comment}
          board={board}
          rootCommentOverlay={rootCommentOverlay}
          discussion={discussion}
          isLast={i === nodes.length - 1}
        />
      ))}
      <LoadMore
        t={t}
        visualDepth={0}
        count={numMoreComments}
        onClick={loadMore}
      />
    </>
  )
}
