import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

const userProgressConsentFragment = `
  fragment ProgressConsent on User {
    progressConsent: hasConsentedTo(name: "PROGRESS")
  }
`

export const userProgressFragment = `
  fragment UserProgressOnDocument on Document {
    userProgress {
      id
      percentage
      nodeId
      updatedAt
      max {
        id
        percentage
        updatedAt
      }
    }
  }
`

const upsertDocumentProgressMutation = gql`
  mutation upsertDocumentProgress(
    $documentId: ID!
    $percentage: Float!
    $nodeId: String!
  ) {
    upsertDocumentProgress(
      documentId: $documentId
      percentage: $percentage
      nodeId: $nodeId
    ) {
      id
      document {
        id
        ...UserProgressOnDocument
      }
    }
  }
  ${userProgressFragment}
`

const removeDocumentProgress = gql`
  mutation removeDocumentProgress($documentId: ID!) {
    removeDocumentProgress(documentId: $documentId) {
      id
      document {
        id
        ...UserProgressOnDocument
      }
    }
  }
  ${userProgressFragment}
`

export const submitConsentMutation = gql`
  mutation submitConsent {
    submitConsent(name: "PROGRESS") {
      id
      ...ProgressConsent
    }
  }
  ${userProgressConsentFragment}
`

export const revokeConsentMutation = gql`
  mutation revokeConsent {
    revokeConsent(name: "PROGRESS") {
      id
      ...ProgressConsent
    }
  }
  ${userProgressConsentFragment}
`

export const withProgressApi = compose(
  graphql(submitConsentMutation, {
    props: ({ mutate }) => ({
      submitProgressConsent: mutate,
    }),
  }),
  graphql(revokeConsentMutation, {
    props: ({ mutate }) => ({
      revokeProgressConsent: mutate,
    }),
  }),
  graphql(upsertDocumentProgressMutation, {
    props: ({ mutate }) => ({
      upsertDocumentProgress: (documentId, percentage, nodeId) =>
        mutate({
          variables: {
            documentId,
            percentage,
            nodeId,
          },
        }),
    }),
  }),
  graphql(removeDocumentProgress, {
    props: ({ mutate }) => ({
      removeDocumentProgress: (documentId) =>
        mutate({
          variables: {
            documentId,
          },
        }),
    }),
  }),
)
