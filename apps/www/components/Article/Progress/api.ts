import { useMutation, useQuery } from '@apollo/client'
import {
  ClearProgressDocument,
  RemoveDocumentProgressDocument,
  RevokeConsentDocument,
  SubmitConsentDocument,
  UpsertDocumentProgressDocument,
  GetDocumentProgressDocument,
} from '../../../graphql/republik-api/__generated__/gql/graphql'

export const useProgress = () => {
  const [submitProgressOptOut] = useMutation(SubmitConsentDocument)
  const [clearProgress] = useMutation(ClearProgressDocument)
  const [revokeProgressOptOut] = useMutation(RevokeConsentDocument)
  const [upsertDocumentProgress] = useMutation(UpsertDocumentProgressDocument, {
    refetchQueries: [GetDocumentProgressDocument],
  })
  const [removeDocumentProgress] = useMutation(RemoveDocumentProgressDocument, {
    refetchQueries: [GetDocumentProgressDocument],
  })

  const useDocumentProgress = (variables: { path: string }) => {
    return useQuery(GetDocumentProgressDocument, { variables })
  }

  return {
    submitProgressOptOut: submitProgressOptOut,
    clearProgress: clearProgress,
    revokeProgressOptOut: revokeProgressOptOut,
    upsertDocumentProgress: upsertDocumentProgress,
    removeDocumentProgress: removeDocumentProgress,
    useDocumentProgress: useDocumentProgress,
  }
}
