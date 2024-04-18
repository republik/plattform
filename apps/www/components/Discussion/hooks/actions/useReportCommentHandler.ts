import { useMe } from './../../../../lib/context/MeContext'
import { toRejectedString } from '../../graphql/utils'
import { useMutation } from '@apollo/client'
import { REPORT_COMMENT_MUTATION } from '../../graphql/documents'
import { useLocalCommentReports } from '../../helpers/useLocalCommentReports'

export type ReportCommentHandler = (
  commentId: string,
  description?: string,
) => Promise<unknown>

function useReportCommentHandler(): ReportCommentHandler {
  const [reportCommentMutation] = useMutation(REPORT_COMMENT_MUTATION)
  const { me } = useMe()
  const { addLocalCommentReport } = useLocalCommentReports()

  // TODO: if guest store the reported comments in local storage for 30 days

  function reportCommentHandler(commentId, description) {
    return reportCommentMutation({
      variables: {
        commentId: commentId,
        description: description,
      },
    })
      .then((res) => {
        if (!me) {
          addLocalCommentReport(commentId)
        }
        return res
      })

      .catch(toRejectedString)
  }

  return reportCommentHandler
}

export default useReportCommentHandler
