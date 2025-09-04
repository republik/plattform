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
  const [upsertDocumentProgress] = useMutation(UpsertDocumentProgressDocument)
  const [removeDocumentProgress] = useMutation(RemoveDocumentProgressDocument)
  const getDocumentProgress = useQuery(GetDocumentProgressDocument)

  return {
    submitProgressOptOut: submitProgressOptOut,
    clearProgress: clearProgress,
    revokeProgressOptOut: revokeProgressOptOut,
    upsertDocumentProgress: upsertDocumentProgress,
    removeDocumentProgress: removeDocumentProgress,
    getDocumentProgress: getDocumentProgress,
  }
}
