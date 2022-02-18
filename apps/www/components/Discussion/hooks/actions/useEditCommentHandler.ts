import { useMutation } from '@apollo/client'
import { EDIT_COMMENT_MUTATION } from '../../graphql/documents'
import { toRejectedString } from '../../graphql/utils'

export type EditCommentHandler = (
  commentId: string,
  content: string,
  tags: string[],
) => Promise<unknown>

function useEditCommentHandler(): EditCommentHandler {
  const [editCommentMutation] = useMutation(EDIT_COMMENT_MUTATION)

  function editCommentHandler(commentId, content, tags) {
    return editCommentMutation({
      variables: {
        commentId,
        content,
        tags,
      },
    }).catch(toRejectedString)
  }

  return editCommentHandler
}

export default useEditCommentHandler
