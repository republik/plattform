import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'

/**
 * TODO: Resolve user profiles for linked
 * TODO: How does pagination work here?
 * TODO: Replace getResizedSrcs with new AssetImage
 *
 */

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
    $subjectFilter: String
    $cursorHighlighted: String
    $cursorNotHighlighted: String
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
        first: 10
        after: $cursorHighlighted
        filters: { submissionIds: $highlightedPostcardIds, hasAnswers: true }
        search: $subjectFilter
      ) {
        ...PostcardConnection
      }

      notHighlighted: submissions(
        first: 10
        after: $cursorNotHighlighted
        filters: { notSubmissionIds: $highlightedPostcardIds, hasAnswers: true }
        search: $subjectFilter
      ) {
        ...PostcardConnection
      }
    }
  }
`

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
  author: { name: string }
}

type PostcardsData =
  | {
      _state: 'LOADING'
    }
  | { _state: 'ERROR' }
  | {
      _state: 'LOADED'
      postcards: Postcard[]
      fetchMoreHighlighted: () => void
      fetchMoreNotHighlighted: () => void
      totalCount: number
    }

type HighlightedPostcard = {
  id: string
  text: string
}

type SubjectFilter = keyof typeof SUBJECT_FILTERS

// Fugly parsing!
// FIXME: add stricter types
const parsePostcardData =
  ({ data, isHighlighted }) =>
  (submission) => {
    const imageAnswer = submission.answers.nodes?.[0]?.payload?.value?.[0]
    const imageUrl = data.questionnaire?.questions?.[0]?.options?.find(
      ({ value }) => value === imageAnswer,
    )?.imageUrl
    const text = submission.answers.nodes?.[1]?.payload?.value

    // const image = `${CDN_FRONTEND_BASE_URL}${imageUrl}?size=1500x1057` // FIXME: use correct/consistent size for all images

    return {
      id: submission.id,
      text,
      imageUrl,
      imageSelection: imageAnswer,
      isHighlighted,
      author: {
        name: submission.displayAuthor.name,
      },
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
    highlightedPostcards?.map(({ id }) => id) ?? null

  // Query needs labels to search by subject, that's why we translate from the value to the label
  const subjectFilterLabel =
    subjectFilter && subjectFilter in SUBJECT_FILTERS
      ? SUBJECT_FILTERS[subjectFilter]
      : undefined

  const { data, loading, error, fetchMore } = useQuery(POSTCARDS_QUERY, {
    variables: {
      highlightedPostcardIds,
      subjectFilter: subjectFilterLabel,
    },
  })

  if (error) {
    return { _state: 'ERROR' }
  }

  if (loading) {
    return {
      _state: 'LOADING',
    }
  }

  if (data.questionnaire == null) {
    return {
      _state: 'ERROR',
    }
  }

  const highlightedPostcardsData = data.questionnaire.highlighted?.nodes.map(
    parsePostcardData({ data, isHighlighted: true }),
  )
  const notHighlightedPostcardsData =
    data.questionnaire.notHighlighted?.nodes.map(
      parsePostcardData({ data, isHighlighted: false }),
    )

  const totalCount =
    data.questionnaire.highlighted?.totalCount +
    data.questionnaire.notHighlighted?.totalCount

  // Pagination stuff

  const cursorHighlighted: string | null =
    data.questionnaire.highlighted?.pageInfo.endCursor
  const hasMoreHighlighted =
    data.questionnaire.highlighted?.pageInfo.hasNextPage

  const fetchMoreHighlighted = () => {
    console.log('should I fetch more hili?', hasMoreHighlighted)
    if (hasMoreHighlighted) {
      fetchMore({
        variables: {
          highlightedPostcardIds,
          subjectFilter: subjectFilterLabel,
          cursorHighlighted,
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
            },
          }
        },
      })
    }
  }

  const cursorNotHighlighted: string | null =
    data.questionnaire.notHighlighted?.pageInfo.endCursor
  const hasMoreNotHighlighted =
    data.questionnaire.notHighlighted?.pageInfo.hasNextPage

  const fetchMoreNotHighlighted = () => {
    if (hasMoreNotHighlighted) {
      fetchMore({
        variables: {
          highlightedPostcardIds,
          subjectFilter: subjectFilterLabel,
          cursorNotHighlighted,
        },
        updateQuery(previousResult, { fetchMoreResult }) {
          return {
            ...fetchMoreResult,
            questionnaire: {
              ...fetchMoreResult.questionnaire,
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
  }

  return {
    _state: 'LOADED',
    postcards: [...highlightedPostcardsData, ...notHighlightedPostcardsData],
    totalCount,
    fetchMoreHighlighted,
    fetchMoreNotHighlighted,
  }
}
