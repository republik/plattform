import EmptyDiscussion from './shared/EmptyDiscussion'
import StatementContainer from './CommentContainers/StatementContainer'
import CommentContainer from './CommentContainers/CommentContainer'
import { CommentTreeNode } from './helpers/makeCommentTree'
import { BoardComment } from '@project-r/styleguide'
import { DiscussionQuery } from './graphql/queries/DiscussionQuery.graphql'

type Props = {
  comments: CommentTreeNode[]
  discussion: DiscussionQuery['discussion']
  inRootCommentOverlay?: boolean
  documentMeta?: any
}

const DiscussionCommentTreeRenderer = ({
  comments = [],
  documentMeta,
  inRootCommentOverlay,
  discussion,
}: Props) => {
  if (comments.length === 0) {
    return <EmptyDiscussion />
  }

  if (documentMeta?.discussionType === 'statements') {
    const tagMappings = documentMeta?.tagMappings ?? []

    return (
      <>
        {comments.map((comment) => (
          <StatementContainer
            key={comment.id}
            comment={comment}
            tagMappings={tagMappings}
          />
        ))}
      </>
    )
  }

  if (discussion?.isBoard && !inRootCommentOverlay) {
    return (
      <>
        {comments.map((comment) => (
          <CommentContainer
            key={comment.id}
            CommentComponent={BoardComment}
            comment={comment}
            isBoard
          />
        ))}
      </>
    )
  }

  return (
    <>
      {comments.map((comment, index) => (
        <CommentContainer
          key={comment.id}
          comment={comment}
          isLast={index === comments.length - 1}
          inRootCommentOverlay={inRootCommentOverlay}
        />
      ))}
    </>
  )
}

export default DiscussionCommentTreeRenderer
