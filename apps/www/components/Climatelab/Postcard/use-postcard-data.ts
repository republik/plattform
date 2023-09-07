import { gql } from '@/generated/graphql'
import { useLazyQuery, useQuery } from '@apollo/client'
import { useState } from 'react'

const POSTCARDS_QUESTIONNAIRE_QUERY = gql(`
  query postcardsQuestionnaire {
    questionnaire(slug: "klima-postkarte") {
      id
      questions {
        id
      }
    }
  }
`)

const POSTCARDS_STATS_QUERY = gql(`
  query postcardsStats($answers: [SubmissionFilterAnswer!]!) {
    questionnaire(slug: "klima-postkarte") {
      id
      postcard_1: submissions(
        filters: { answers: $answers }
        value: "postcard_1"
      ) {
        totalCount
      }
      postcard_2: submissions(
        filters: { answers: $answers }
        value: "postcard_2"
      ) {
        totalCount
      }
      postcard_3: submissions(
        filters: { answers: $answers }
        value: "postcard_3"
      ) {
        totalCount
      }
      postcard_4: submissions(
        filters: { answers: $answers }
        value: "postcard_4"
      ) {
        totalCount
      }
    }
  }
`)

const POSTCARDS_QUERY = gql(`
  fragment PostcardConnection on SubmissionConnection {
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
        }
      }
    }
  }

  query publicPostcardsQuery(
    $includeHighlightedPostcardIds: [ID!]
    $ignoreNotHighlightedPostcardIds: [ID!]
    $answers: [SubmissionFilterAnswer!]!
    $cursorHighlighted: String
    $cursorNotHighlighted: String
    $limit: Int
    $valueHighlighted: String
    $valueNotHighlighted: String
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
        }
      }

      highlighted: submissions(
        first: $limit
        after: $cursorHighlighted
        filters: {
          submissionIds: $includeHighlightedPostcardIds
          answers: $answers
        }
        value: $valueHighlighted
      ) {
        ...PostcardConnection
      }

      notHighlighted: submissions(
        first: $limit
        after: $cursorNotHighlighted
        filters: {
          notSubmissionIds: $ignoreNotHighlightedPostcardIds
          answers: $answers
        }
        value: $valueNotHighlighted
      ) {
        ...PostcardConnection
      }
    }
  }
`)

// Keep these in sync with the query!
type QueryVars = {
  includeHighlightedPostcardIds?: string[]
  ignoreNotHighlightedPostcardIds?: string[]
  answers?: { questionId: string }[]
  cursorHighlighted?: string
  cursorNotHighlighted?: string
  limit?: number
  valueHighlighted?: string
  valueNotHighlighted?: string
}

type QueryData = {
  questionnaire?: {
    id: string
    questions: any
    highlighted: any
    notHighlighted: any
  }
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

export type SinglePostcardData = {
  loading: boolean
  fetchNext: () => void
  error?: Error
  postcard?: Postcard | null
  hasMore?: boolean
}

export type HighlightedPostcard = {
  id: string
  text: string
}

type SubjectFilter = 'postcard_1' | 'postcard_2' | 'postcard_3' | 'postcard_4'

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
 * Fetch postcard stats
 */
export const usePostcardCounts = () => {
  const { questionIds } = useQuestionnaireQuestions()

  const { data, loading, error } = useQuery(POSTCARDS_STATS_QUERY, {
    variables: {
      answers: questionIds.map((id) => ({
        questionId: id,
      })),
    },
    skip: questionIds === undefined,
  })

  if (!data) {
    return { loading, error }
  }

  if (data) {
    return {
      loading,
      error,
      counts: {
        postcard_1: data.questionnaire?.postcard_1?.totalCount,
        postcard_2: data.questionnaire?.postcard_2?.totalCount,
        postcard_3: data.questionnaire?.postcard_3?.totalCount,
        postcard_4: data.questionnaire?.postcard_4?.totalCount,
      },
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

  const { questionIds } = useQuestionnaireQuestions()

  const { data, loading, error, fetchMore } = useQuery<QueryData, QueryVars>(
    POSTCARDS_QUERY,
    {
      variables: {
        limit: 100,
        includeHighlightedPostcardIds: highlightedPostcardIds,
        ignoreNotHighlightedPostcardIds: highlightedPostcardIds,
        valueHighlighted: subjectFilter,
        valueNotHighlighted: subjectFilter,
        answers: questionIds?.map((id) => ({
          questionId: id,
        })),
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
  ignorePostcardId,
  subjectFilter,
}: {
  highlightedPostcards?: HighlightedPostcard[]
  ignorePostcardId?: string
  subjectFilter?: SubjectFilter
}): SinglePostcardData => {
  const includeHighlightedPostcardIds =
    highlightedPostcards?.length > 0
      ? highlightedPostcards.flatMap(({ id }) =>
          id !== ignorePostcardId ? [id] : [],
        )
      : ['x-y-zzz'] // provide a nonsensical ID here to get 0 highlighted results from the query

  const [lastHighlightedPostcardReached, setLastHighlightedPostcardReached] =
    useState(false)

  const { questionIds } = useQuestionnaireQuestions()

  const [fetchQuery, { data, loading, error, refetch, called }] = useLazyQuery<
    QueryData,
    QueryVars
  >(POSTCARDS_QUERY, {
    variables: {
      limit: 1,
      includeHighlightedPostcardIds,
      ignoreNotHighlightedPostcardIds: ignorePostcardId
        ? includeHighlightedPostcardIds.concat(ignorePostcardId)
        : includeHighlightedPostcardIds,
      valueHighlighted: subjectFilter,
      valueNotHighlighted: subjectFilter,
      answers: questionIds?.map((id) => ({
        questionId: id,
      })),
    },
    notifyOnNetworkStatusChange: true,
  })

  if (called && data && !loading) {
    if (data.questionnaire == null) {
      return {
        loading,
        error: new Error('No Questionnaire found'),
        fetchNext: () => {
          /*noop*/
        },
      }
    }

    const highlightedPostcardsData = data.questionnaire.highlighted?.nodes.map(
      parsePostcardData({ data, isHighlighted: true, highlightedPostcards }),
    )
    const notHighlightedPostcardsData =
      data.questionnaire.notHighlighted?.nodes.map(
        parsePostcardData({ data, isHighlighted: false }),
      )

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
          // limit: 1,
          cursorHighlighted,
        })
      } else if (!lastHighlightedPostcardReached) {
        setLastHighlightedPostcardReached(true)
      } else if (hasMoreNotHighlighted) {
        refetch({
          // limit: 1,
          cursorNotHighlighted,
        })
      }
    }

    return {
      loading,
      error,
      postcard,
      fetchNext,
      hasMore: hasMoreHighlighted || hasMoreNotHighlighted,
    }
  }

  return {
    loading,
    error,
    fetchNext: () => {
      fetchQuery()
    },
  }
}
