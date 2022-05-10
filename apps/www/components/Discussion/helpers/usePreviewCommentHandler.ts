import { useApolloClient } from '@apollo/client'

import {
  PREVIEW_COMMENT_QUERY,
  PreviewCommentQuery,
  PreviewCommentQueryVariables,
} from '../graphql/queries/PreviewCommentQuery.graphql'
import { errorToString } from '../../../lib/utils/errors'
import { useDiscussion } from '../context/DiscussionContext'

export type PreviewCommentHandler = (
  variables: PreviewCommentQueryVariables,
) => Promise<PreviewCommentQuery['commentPreview']>

function usePreviewCommentHandler(): PreviewCommentHandler {
  const { id } = useDiscussion()
  const { query } = useApolloClient()

  return async (
    variables: Omit<PreviewCommentQueryVariables, 'id'>,
  ): Promise<PreviewCommentQuery['commentPreview']> => {
    return await query<PreviewCommentQuery, PreviewCommentQueryVariables>({
      query: PREVIEW_COMMENT_QUERY,
      variables: {
        ...variables,
        discussionId: id,
      },
    })
      .then((result) => result?.data?.commentPreview)
      .catch(errorToString)
  }
}

export default usePreviewCommentHandler
