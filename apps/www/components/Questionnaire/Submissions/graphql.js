import { gql } from '@apollo/client'

export const SUPPORTED_SORT = [
  {
    key: 'random',
  },
  {
    key: 'createdAt',
    directions: ['DESC', 'ASC'],
  },
]

export const SORT_KEY_PARAM = 'skey'
export const SORT_DIRECTION_PARAM = 'sdir'
export const QUERY_PARAM = 'q'

const submissionData = gql`
  fragment QuestionnaireSubmissionFragment on Submission {
    id
    createdAt
    updatedAt
    displayAuthor {
      id
      name
      slug
      profilePicture
    }
    answers {
      totalCount
      nodes {
        id
        hasMatched
        question {
          __typename
          id
        }
        payload
      }
    }
  }
`

const questionnaireData = gql`
  fragment QuestionnaireFragment on Questionnaire {
    id
    beginDate
    endDate
    userHasSubmitted
    userSubmitDate
    questions {
      __typename
      id
      text
      turnout {
        submitted
      }
      ... on QuestionTypeChoice {
        options {
          label
          value
          category
        }
        result {
          count
          option {
            label
            value
          }
        }
      }
      ... on QuestionTypeRange {
        kind
        ticks {
          label
          value
        }
      }
    }
    submissions {
      totalCount
    }
  }
`

export const SINGLE_SUBMISSION_QUERY = gql`
  query getSingleQuestionnaireSubmission($slug: String!, $id: ID!) {
    questionnaire(slug: $slug) {
      id
      submissions(filters: { id: $id }) {
        nodes {
          ...QuestionnaireSubmissionFragment
        }
      }
    }
  }
  ${submissionData}
`

export const QUESTIONNAIRE_QUERY = gql`
  query getQuestionnaire($slug: String!) {
    questionnaire(slug: $slug) {
      ...QuestionnaireFragment
    }
  }
  ${questionnaireData}
`

export const QUESTIONNAIRE_SUBMISSION_BOOL_QUERY = gql`
  query getQuestionnaireSubmissionBool($slug: String!, $userIds: [ID!]) {
    questionnaire(slug: $slug) {
      id
      results: submissions(filters: { userIds: $userIds }) {
        totalCount
        nodes {
          id
        }
      }
    }
  }
`

export const QUESTIONNAIRE_WITH_SUBMISSIONS_QUERY = gql`
  query getQuestionnaireWithSubmissions(
    $slug: String!
    $search: String
    $first: Int
    $after: String
    $sortBy: SubmissionsSortBy!
    $sortDirection: OrderDirection
    $answers: [SubmissionFilterAnswer]
    $id: ID
    $userIds: [ID!]
  ) {
    questionnaire(slug: $slug) {
      ...QuestionnaireFragment
      results: submissions(
        search: $search
        first: $first
        after: $after
        sort: { by: $sortBy, direction: $sortDirection }
        filters: { answers: $answers, id: $id, userIds: $userIds }
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          ...QuestionnaireSubmissionFragment
        }
      }
    }
  }
  ${questionnaireData}
  ${submissionData}
`

// The same query as above but excluding the QuestionnaireFragment,
// which should improve query performance significantly in
// case the data is not needed.
export const QUESTIONNAIRE_ONLY_SUBMISSIONS_QUERY = gql`
  query getQuestionnaireOnlySubmissions(
    $slug: String!
    $search: String
    $first: Int
    $after: String
    $sortBy: SubmissionsSortBy!
    $sortDirection: OrderDirection
    $answers: [SubmissionFilterAnswer]
    $id: ID
    $userIds: [ID!]
  ) {
    questionnaire(slug: $slug) {
      id
      results: submissions(
        search: $search
        first: $first
        after: $after
        sort: { by: $sortBy, direction: $sortDirection }
        filters: { answers: $answers, id: $id, userIds: $userIds }
      ) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          ...QuestionnaireSubmissionFragment
        }
      }
    }
  }
  ${submissionData}
`

export const QUESTIONNAIRE_USER_QUERY = gql`
  query getUserId($slug: String!) {
    user(slug: $slug) {
      id
      name
      statement
      portrait
    }
  }
`

export const loadMoreSubmissions = (fetchMore, data) => () => {
  return fetchMore({
    variables: {
      after: data.questionnaire.results.pageInfo.endCursor,
    },
    updateQuery: (previousResult = {}, { fetchMoreResult = {} }) => {
      const previousNodes = previousResult.questionnaire.results.nodes || []
      const newNodes = fetchMoreResult.questionnaire.results.nodes || []

      const res = {
        ...previousResult,
        ...fetchMoreResult,
        questionnaire: {
          ...previousResult.questionnaire,
          ...fetchMoreResult.questionnaire,
          results: {
            ...previousResult.questionnaire.results,
            ...fetchMoreResult.questionnaire.results,
            nodes: [...previousNodes, ...newNodes],
          },
        },
      }
      return res
    },
  })
}

export const hasMoreData = (data) =>
  data?.questionnaire?.results?.pageInfo?.hasNextPage
