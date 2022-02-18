import { useMutation } from '@apollo/client'
import { UNPUBLISH_COMMENT_MUTATION } from '../../graphql/documents'
import { toRejectedString } from '../../graphql/utils'

export type UnpublishCommentHandler = (commentId: string) => Promise<unknown>

function useUnpublishCommentHandler(): UnpublishCommentHandler {
  const [unpublishCommentMutation] = useMutation(UNPUBLISH_COMMENT_MUTATION)

  function unpublishCommentHandler(commentId: string) {
    return unpublishCommentMutation({
      variables: {
        commentId: commentId,
      },
    }).catch(toRejectedString)
  }

  return unpublishCommentHandler
}

export default useUnpublishCommentHandler
