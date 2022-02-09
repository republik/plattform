import { toRejectedString } from '../../graphql/utils'
import { useMutation } from '@apollo/client'
import { REPORT_COMMENT_MUTATION } from '../../graphql/documents'

export type ReportCommentHandler = (commentId: string) => Promise<unknown>

function useReportCommentHandler(): ReportCommentHandler {
  const [reportCommentMutation] = useMutation(REPORT_COMMENT_MUTATION)

  function reportCommentHandler(commentId) {
    return reportCommentMutation({
      variables: {
        commentId: commentId,
      },
    }).catch(toRejectedString)
  }

  return reportCommentHandler
}

export default useReportCommentHandler
