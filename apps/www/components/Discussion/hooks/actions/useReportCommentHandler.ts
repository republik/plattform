import { useMutation } from '@apollo/client'
import { REPORT_COMMENT_MUTATION } from '../../graphql/documents'
import { toRejectedString } from '../../graphql/utils'

export type ReportCommentHandler = (
  commentId: string,
  description?: string,
) => Promise<unknown>

function useReportCommentHandler(): ReportCommentHandler {
  const [reportCommentMutation] = useMutation(REPORT_COMMENT_MUTATION)

  function reportCommentHandler(commentId, description) {
    return reportCommentMutation({
      variables: {
        commentId: commentId,
        description: description,
      },
    })
      .then((res) => {
        return res
      })

      .catch(toRejectedString)
  }

  return reportCommentHandler
}

export default useReportCommentHandler
