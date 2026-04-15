import CommentContainer from './CommentContainers/CommentContainer'
import { CommentTreeNode } from './helpers/makeCommentTree'
import EmptyDiscussion from './shared/EmptyDiscussion'

type Props = {
  comments: CommentTreeNode[]
}

const DiscussionCommentTreeRenderer = ({ comments = [] }: Props) => {
  if (comments.length === 0) {
    return <EmptyDiscussion />
  }

  return (
    <>
      {comments.map((comment, index) => (
        <CommentContainer
          key={comment.id}
          comment={comment}
          isLast={index === comments.length - 1}
        />
      ))}
    </>
  )
}

export default DiscussionCommentTreeRenderer
