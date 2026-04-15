import { useMutation } from '@apollo/client'
import {
  DOWN_VOTE_COMMENT_ACTION,
  UP_VOTE_COMMENT_ACTION,
  UPVOTE_COMMENT_MUTATION,
} from '../../graphql/documents'
import { toRejectedString } from '../../graphql/utils'

export type VoteCommentHandlers = {
  upVoteCommentHandler: (commentId: string) => Promise<unknown>
  downVoteCommentHandler: (commentId: string) => Promise<unknown>
  unVoteCommentHandler: (commentId: string) => Promise<unknown>
}

function useVoteCommentHandlers(): VoteCommentHandlers {
  const [upVoteCommentMutation] = useMutation(UPVOTE_COMMENT_MUTATION)
  const [downVoteCommentMutation] = useMutation(DOWN_VOTE_COMMENT_ACTION)
  const [unVoteCommentMutation] = useMutation(UP_VOTE_COMMENT_ACTION)

  function upVoteCommentHandler(commentId) {
    return upVoteCommentMutation({
      variables: {
        commentId: commentId,
      },
    }).catch(toRejectedString)
  }

  function downVoteCommentHandler(commentId) {
    return downVoteCommentMutation({
      variables: {
        commentId: commentId,
      },
    }).catch(toRejectedString)
  }

  function unVoteCommentHandler(commentId) {
    return unVoteCommentMutation({
      variables: {
        commentId: commentId,
      },
    }).catch(toRejectedString)
  }

  return {
    upVoteCommentHandler,
    downVoteCommentHandler,
    unVoteCommentHandler,
  }
}

export default useVoteCommentHandlers
