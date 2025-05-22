import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'

const submitAnswerMutation = gql`
  mutation submitAnswer($answerId: ID!, $questionId: ID!, $payload: JSON) {
    submitAnswer(
      answer: { id: $answerId, questionId: $questionId, payload: $payload }
    ) {
      ... on QuestionInterface {
        id
        userAnswer {
          id
          payload
        }
      }
    }
  }
`

const anonymizeQuestionnaireMutation = gql`
  mutation anonymizeUserAnswers($questionnaireId: ID!) {
    anonymizeUserAnswers(questionnaireId: $questionnaireId) {
      id
    }
  }
`

const resetQuestionnaireMutation = gql`
  mutation resetQuestionnaire($id: ID!) {
    resetQuestionnaire(id: $id) {
      id
    }
  }
`

const revokeQuestionnaireMutation = gql`
  mutation revokeQuestionnaire($id: ID!) {
    revokeQuestionnaire(id: $id) {
      id
    }
  }
`

const submitQuestionnaireMutation = gql`
  mutation submitQuestionnaire($id: ID!) {
    submitQuestionnaire(id: $id) {
      id
      userSubmitDate
      userHasSubmitted
      userSubmissionId
    }
  }
`

const getQuestionnaire = gql`
  query getQuestionnaire($slug: String!) {
    questionnaire(slug: $slug) {
      id
      beginDate
      endDate
      userHasSubmitted
      userSubmitDate
      resubmitAnswers
      revokeSubmissions
      userIsEligible
      questions {
        ... on QuestionInterface {
          id
          order
          text
          explanation
          private
          metadata
          userAnswer {
            id
            payload
          }
        }
        ... on QuestionTypeText {
          maxLength
        }
        ... on QuestionTypeChoice {
          cardinality
          options {
            label
            value
            category
            requireAddress
          }
        }
        ... on QuestionTypeImageChoice {
          options {
            label
            value
            category
            requireAddress
            imageUrl
          }
        }
        ... on QuestionTypeRange {
          kind
          ticks {
            label
            value
          }
        }
        ... on QuestionTypeDocument {
          template
        }
      }
    }
  }
`

const getQuestionnaireAndResults = gql`
  query getQuestionnaire($slug: String!) {
    questionnaire(slug: $slug) {
      id
      slug
      beginDate
      userIsEligible
      userHasSubmitted
      unattributedAnswers
      turnout {
        eligible
        submitted
      }
      questions {
        __typename
        ... on QuestionInterface {
          id
          text
          order
          metadata
          userAnswer {
            id
            payload
          }
          turnout {
            skipped
            submitted
          }
        }
        ... on QuestionTypeChoice {
          cardinality
          options {
            label
            value
            category
          }
          choiceResults: result {
            count
            option {
              label
              value
              category
            }
          }
        }
      }
    }
  }
`

export const withQuestionnaire = graphql(getQuestionnaire, {
  name: 'questionnaireData',
  options: ({ slug }) => ({
    variables: {
      slug,
    },
  }),
})

export const withQuestionnaireAndResults = graphql(getQuestionnaireAndResults, {
  name: 'questionnaireData',
  options: ({ slug, pollInterval = 0 }) => ({
    pollInterval,
    variables: { slug },
  }),
})

export const withQuestionnaireMutation = graphql(submitQuestionnaireMutation, {
  props: ({ mutate }) => ({
    submitQuestionnaire: (id) => {
      return mutate({
        variables: {
          id,
        },
      })
    },
  }),
})

export const withQuestionnaireReset = graphql(resetQuestionnaireMutation, {
  props: ({ mutate, ownProps: { slug } }) => ({
    resetQuestionnaire: (id) => {
      return mutate({
        variables: {
          id,
        },
        refetchQueries: [
          {
            query: getQuestionnaire,
            variables: { slug },
          },
        ],
      })
    },
  }),
})

export const withQuestionnaireRevoke = graphql(revokeQuestionnaireMutation, {
  props: ({ mutate, ownProps: { slug } }) => ({
    revokeQuestionnaire: (id) => {
      return mutate({
        variables: {
          id,
        },
        refetchQueries: [
          {
            query: getQuestionnaire,
            variables: { slug },
          },
        ],
        awaitRefetchQueries: true,
      })
    },
  }),
})

export const withQuestionnaireAnonymize = graphql(
  anonymizeQuestionnaireMutation,
  {
    props: ({ mutate, ownProps: { slug } }) => ({
      anonymizeQuestionnaire: (questionnaireId) => {
        return mutate({
          variables: {
            questionnaireId,
          },
          refetchQueries: [
            {
              query: getQuestionnaire,
              variables: { slug },
            },
          ],
          awaitRefetchQueries: true,
        })
      },
    }),
  },
)

export const withAnswerMutation = graphql(submitAnswerMutation, {
  props: ({ mutate, ownProps: { slug } }) => ({
    submitAnswer: (questionId, payload, answerId) => {
      return mutate({
        variables: {
          answerId,
          questionId,
          payload,
        },
        optimisticResponse: {
          __typename: 'Mutation',
          submitAnswer: {
            __typename: 'QuestionInterface',
            id: questionId,
            userAnswer: {
              __typename: 'Answer',
              id: answerId,
              payload,
            },
          },
        },
        update: (proxy, { data: { submitAnswer } }) => {
          const queryObj = {
            query: getQuestionnaire,
            variables: { slug },
          }
          const data = proxy.readQuery(queryObj)
          const questionIndex = data.questionnaire.questions.findIndex(
            (q) => q.id === questionId,
          )
          const newData = {
            ...data,
            questionnaire: {
              ...data.questionnaire,
              questions: [
                ...data.questionnaire.questions.slice(0, questionIndex),
                {
                  ...data.questionnaire.questions[questionIndex],
                  userAnswer: submitAnswer.userAnswer,
                },
                ...data.questionnaire.questions.slice(questionIndex + 1),
              ],
            },
          }
          proxy.writeQuery({
            ...queryObj,
            data: newData,
          })
        },
      })
    },
  }),
})

export const withSurveyAnswerMutation = graphql(submitAnswerMutation, {
  props: ({ mutate, ownProps: { slug } }) => ({
    submitAnswer: (question, payload, answerId) => {
      return mutate({
        variables: {
          answerId,
          questionId: question.id,
          payload,
        },
        refetchQueries: [
          {
            query: getQuestionnaireAndResults,
            variables: { slug },
          },
        ],
        awaitRefetchQueries: true,
      })
    },
  }),
})
