import { gql, useQuery } from '@apollo/client'
import { useState } from 'react'

const POSTCARDS_QUESTIONNAIRE_QUERY = gql`
  query postcardsQuestionnaire {
    questionnaire(slug: "klima-postkarte") {
      questions {
        id
      }
    }
  }
`

const POSTCARDS_QUERY = gql`
  fragment PostcardConnection on SubmissionConnection {
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      displayAuthor {
        name
        anonymity
      }
      answers {
        nodes {
          id
          payload
          question {
            id
            ... on QuestionInterface {
              id
              __typename
              text
            }
          }
        }
      }
    }
  }

  query publicPostcardsQuery(
    $highlightedPostcardIds: [ID!]
    $questionIds: [ID!]
    $cursorHighlighted: String
    $cursorNotHighlighted: String
    $limit: Int
    $searchHighlighted: String
    $searchNotHighlighted: String
  ) {
    questionnaire(slug: "klima-postkarte") {
      id
      questions {
        id
        ... on QuestionTypeImageChoice {
          options {
            value
            imageUrl
          }
          result {
            option {
              value
            }
            count
          }
        }
      }

      highlighted: submissions(
        first: $limit
        after: $cursorHighlighted
        filters: {
          submissionIds: $highlightedPostcardIds
          answeredQuestionIds: $questionIds
        }
        search: $searchHighlighted
      ) {
        ...PostcardConnection
      }

      notHighlighted: submissions(
        first: $limit
        after: $cursorNotHighlighted
        filters: {
          notSubmissionIds: $highlightedPostcardIds
          answeredQuestionIds: $questionIds
        }
        search: $searchNotHighlighted
      ) {
        ...PostcardConnection
      }
    }
  }
`

// Keep these in sync with the query!
type QueryVars = {
  highlightedPostcardIds?: string[]
  questionIds?: string[]
  cursorHighlighted?: string
  cursorNotHighlighted?: string
  limit?: number
  searchHighlighted?: string
  searchNotHighlighted?: string
}

type QueryData = {
  questionnaire?: {
    id: string
    questions: any
    highlighted: any
    notHighlighted: any
  }
}

const SUBJECT_FILTERS = {
  postcard_1: 'Karlotta Freier',
  postcard_2: 'Chrigel Farner',
  postcard_3: 'Jack Richardson',
  postcard_4: 'Aline Zalko',
}

export type Postcard = {
  id: string
  text: string
  isHighlighted: boolean
  imageUrl: string
  imageSelection: string
  author: { name: string; anonymity: boolean }
}

export type PostcardsData =
  | {
      _state: 'LOADING'
    }
  | { _state: 'ERROR'; error: Error }
  | {
      _state: 'LOADED'
      postcards: Postcard[]
      fetchMore: () => void
      totalCount: number
      hasMore: boolean
    }

export type SinglePostcardData =
  | {
      _state: 'LOADING'
    }
  | { _state: 'ERROR'; error: Error }
  | {
      _state: 'LOADED'
      totalCount: number
      postcard: Postcard | null
      fetchNext: () => void
      hasMore: boolean
    }

export type HighlightedPostcard = {
  id: string
  text: string
}

type SubjectFilter = keyof typeof SUBJECT_FILTERS

// Fugly parsing!
// FIXME: add stricter types
const parsePostcardData =
  ({
    data,
    isHighlighted,
    highlightedPostcards,
  }: {
    data: QueryData
    isHighlighted: boolean
    highlightedPostcards?: HighlightedPostcard[]
  }) =>
  (submission) => {
    const imageAnswer = submission.answers.nodes?.[0]?.payload?.value?.[0]
    const imageUrl = data.questionnaire?.questions?.[0]?.options?.find(
      ({ value }) => value === imageAnswer,
    )?.imageUrl
    let text = submission.answers.nodes?.[1]?.payload?.value

    // Overwrite text of highlighted postcards with what's provided via props
    if (highlightedPostcards) {
      const highlightedPostcard = highlightedPostcards.find(
        ({ id }) => id === submission.id,
      )

      if (highlightedPostcard) {
        text = highlightedPostcard.text
      }
    }

    // const image = `${CDN_FRONTEND_BASE_URL}${imageUrl}?size=1500x1057` // FIXME: use correct/consistent size for all images

    return {
      id: submission.id,
      text,
      imageUrl,
      imageSelection: imageAnswer,
      isHighlighted,
      author: {
        name: submission.displayAuthor.name,
        anonymity: submission.displayAuthor.anonymity,
      },
    }
  }

/**
 * Fetch questionnaire question IDs to filter submissions
 */
const useQuestionnaireQuestions = () => {
  const { data, loading, error } = useQuery(POSTCARDS_QUESTIONNAIRE_QUERY)

  if (!data) {
    return { loading, error }
  }

  if (data) {
    return {
      loading,
      error,
      questionIds: data.questionnaire?.questions.map((q) => q.id),
    }
  }
}

/**
 *
 * TODO: Proper loading/error state
 *
 */
export const usePostcardsData = ({
  highlightedPostcards,
  subjectFilter,
}: {
  highlightedPostcards?: HighlightedPostcard[]
  subjectFilter?: SubjectFilter
}): PostcardsData => {
  const highlightedPostcardIds =
    highlightedPostcards?.length > 0
      ? highlightedPostcards.map(({ id }) => id)
      : ['x-y-zzz'] // provide a nonsensical ID here to get 0 highlighted results from the query

  // Query needs labels to search by subject, that's why we translate from the value to the label
  const subjectFilterLabel =
    subjectFilter && subjectFilter in SUBJECT_FILTERS
      ? SUBJECT_FILTERS[subjectFilter]
      : undefined

  const { questionIds } = useQuestionnaireQuestions()

  const { data, loading, error, fetchMore } = useQuery<QueryData, QueryVars>(
    POSTCARDS_QUERY,
    {
      variables: {
        limit: 100,
        highlightedPostcardIds,
        searchHighlighted: subjectFilterLabel,
        searchNotHighlighted: subjectFilterLabel,
        questionIds,
      },
      skip: questionIds === undefined,
    },
  )

  if (error) {
    return { _state: 'ERROR', error }
  }

  if (loading || !data) {
    return {
      _state: 'LOADING',
    }
  }

  if (data.questionnaire == null) {
    return {
      _state: 'ERROR',
      error: new Error('No Data'),
    }
  }

  const highlightedPostcardsData = data.questionnaire.highlighted?.nodes.map(
    parsePostcardData({ data, isHighlighted: true, highlightedPostcards }),
  )
  const notHighlightedPostcardsData =
    data.questionnaire.notHighlighted?.nodes.map(
      parsePostcardData({ data, isHighlighted: false }),
    )

  // Insert highlighted postcards at each step (repeatedly)
  const steps = [2, 3, 5, 8, 13]
  let stepIndex = 0
  let shuffledIndex = 0
  const shuffledPostcards = [...notHighlightedPostcardsData]
  for (const p of highlightedPostcardsData) {
    const step = steps[stepIndex]
    shuffledIndex = shuffledIndex + step

    if (shuffledIndex > shuffledPostcards.length - 1) {
      break
    }

    // console.log('insert at', shuffledIndex)
    shuffledPostcards.splice(shuffledIndex, 0, p)

    // loop through steps
    stepIndex = stepIndex < steps.length - 1 ? stepIndex + 1 : 0
  }

  const totalCount =
    data.questionnaire.highlighted?.totalCount +
    data.questionnaire.notHighlighted?.totalCount

  // Pagination stuff

  const cursorHighlighted: string | null =
    data.questionnaire.highlighted?.pageInfo.endCursor
  const hasMoreHighlighted =
    data.questionnaire.highlighted?.pageInfo.hasNextPage

  const cursorNotHighlighted: string | null =
    data.questionnaire.notHighlighted?.pageInfo.endCursor
  const hasMoreNotHighlighted =
    data.questionnaire.notHighlighted?.pageInfo.hasNextPage

  const fetchMoreAll = () => {
    fetchMore<Record<string, any>, Record<string, any>>({
      variables: {
        cursorHighlighted,
        cursorNotHighlighted,
      },
      updateQuery(previousResult, { fetchMoreResult }) {
        return {
          ...fetchMoreResult,
          questionnaire: {
            ...fetchMoreResult.questionnaire,
            highlighted: {
              ...fetchMoreResult.questionnaire.highlighted,
              nodes: [
                ...previousResult.questionnaire.highlighted.nodes,
                ...fetchMoreResult.questionnaire.highlighted.nodes,
              ],
            },
            notHighlighted: {
              ...fetchMoreResult.questionnaire.notHighlighted,
              nodes: [
                ...previousResult.questionnaire.notHighlighted.nodes,
                ...fetchMoreResult.questionnaire.notHighlighted.nodes,
              ],
            },
          },
        }
      },
    })
  }

  return {
    _state: 'LOADED',
    postcards: shuffledPostcards,
    totalCount,
    fetchMore: fetchMoreAll,
    hasMore: hasMoreHighlighted || hasMoreNotHighlighted,
  }
}

export const useSinglePostcardData = ({
  highlightedPostcards,
  subjectFilter,
}: {
  highlightedPostcards?: HighlightedPostcard[]
  subjectFilter?: SubjectFilter
}): SinglePostcardData => {
  const highlightedPostcardIds =
    highlightedPostcards?.length > 0
      ? highlightedPostcards.map(({ id }) => id)
      : ['x-y-zzz'] // provide a nonsensical ID here to get 0 highlighted results from the query

  // Query needs labels to search by subject, that's why we translate from the value to the label
  const subjectFilterLabel =
    subjectFilter && subjectFilter in SUBJECT_FILTERS
      ? SUBJECT_FILTERS[subjectFilter]
      : undefined

  const [lastHighlightedPostcardReached, setLastHighlightedPostcardReached] =
    useState(false)

  const { questionIds } = useQuestionnaireQuestions()

  const { data, loading, error, refetch } = useQuery<QueryData, QueryVars>(
    POSTCARDS_QUERY,
    {
      variables: {
        limit: 1,
        highlightedPostcardIds,
        searchHighlighted: subjectFilterLabel,
        searchNotHighlighted: subjectFilterLabel,
        questionIds,
      },
      notifyOnNetworkStatusChange: true,
      skip: questionIds === undefined,
    },
  )

  if (error) {
    return { _state: 'ERROR', error }
  }

  if (loading || !data) {
    return {
      _state: 'LOADING',
    }
  }

  if (data.questionnaire == null) {
    return {
      _state: 'ERROR',
      error: new Error('No Data'),
    }
  }

  const highlightedPostcardsData = data.questionnaire.highlighted?.nodes.map(
    parsePostcardData({ data, isHighlighted: true, highlightedPostcards }),
  )
  const notHighlightedPostcardsData =
    data.questionnaire.notHighlighted?.nodes.map(
      parsePostcardData({ data, isHighlighted: false }),
    )

  // const totalCount =
  //   data.questionnaire.highlighted?.totalCount +
  //   data.questionnaire.notHighlighted?.totalCount

  const questionResults = Object.fromEntries(
    data.questionnaire.questions?.[0]?.result?.map((result) => {
      return [result.option.value, result.count]
    }),
  )

  const totalCount = subjectFilter
    ? questionResults[subjectFilter]
    : Object.values(questionResults).reduce((sum, d) => sum + d)

  // Pagination stuff

  const cursorHighlighted: string | null =
    data.questionnaire.highlighted?.pageInfo.endCursor
  const hasMoreHighlighted =
    data.questionnaire.highlighted?.pageInfo.hasNextPage

  const cursorNotHighlighted: string | null =
    data.questionnaire.notHighlighted?.pageInfo.endCursor
  const hasMoreNotHighlighted =
    data.questionnaire.notHighlighted?.pageInfo.hasNextPage

  // If we have reached the last available highlighted postcard, we pick the top not highlighted one
  const postcard =
    (lastHighlightedPostcardReached
      ? notHighlightedPostcardsData[0]
      : highlightedPostcardsData[0] ?? notHighlightedPostcardsData[0]) ?? null

  const fetchNext = () => {
    // 1. cycle through all highlighted cards
    // 2. if no more highlighted cards, check if there are more, and fetch more
    // 3. otherwise, repeat the same for all not highlighted cards

    if (hasMoreHighlighted) {
      refetch({
        cursorHighlighted,
      })
    } else if (!lastHighlightedPostcardReached) {
      setLastHighlightedPostcardReached(true)
    } else if (hasMoreNotHighlighted) {
      console.log('no more highlighted')
      refetch({
        cursorNotHighlighted,
      })
    }
  }

  return {
    _state: 'LOADED',
    totalCount,
    postcard,
    fetchNext,
    hasMore: hasMoreHighlighted || hasMoreNotHighlighted,
  }
}
