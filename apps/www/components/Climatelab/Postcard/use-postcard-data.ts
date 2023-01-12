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
    nodes {
      id
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

  query publicPostcardsQuery($highlightedPostcardIds: ID) {
    questionnaire(slug: "klima-postkarte") {
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
        first: 100
        filters: { id: $highlightedPostcardIds }
      ) {
        ...PostcardConnection
      }

      notHighlighted: submissions(
        first: 100
        filters: { not: $highlightedPostcardIds }
      ) {
        ...PostcardConnection
      }
    }
  }
`

export type Postcard = {
  id: string
  text: string
  isHighlighted: boolean
  imageUrl: string
  imageSelection: string
  // profileInfo: TODO
}

type PostcardsData =
  | {
      _state: 'LOADING'
    }
  | { _state: 'ERROR' }
  | {
      _state: 'LOADED'
      postcards: Postcard[]
    }

type HighlightedPostcard = {
  id: string
  text: string
}

/**
 *
 * TODO: Proper loading/error state
 *
 */
export const usePostcardsData = ({
  highlightedPostcards,
}: {
  highlightedPostcards?: HighlightedPostcard[]
}): PostcardsData => {
  const highlightedPostcardIds = highlightedPostcards?.[0]?.id ?? '' // FIXME: This should be an array at some point

  const { data, loading, error } = useQuery(POSTCARDS_QUERY, {
    variables: {
      highlightedPostcardIds,
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

  // Fugly parsing!
  // FIXME: add stricter types
  const getPostcardData = (submission) => {
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
    }
  }

  const highlightedPostcardsData =
    data.questionnaire?.highlighted?.nodes.map(getPostcardData)
  const notHighlightedPostcardsData =
    data.questionnaire?.notHighlighted?.nodes.map(getPostcardData)

  return {
    _state: 'LOADED',
    postcards: [...highlightedPostcardsData, ...notHighlightedPostcardsData],
  }
}

export const useMockPostcardsData = (): PostcardsData => {
  const images = [
    '/static/climatelab/freier.jpg',
    '/static/climatelab/farner.jpg',
    '/static/climatelab/richardson.jpg',
    '/static/climatelab/zalko.jpg',
  ]

  const postcards = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => {
      const imageUrl = images[Math.floor(Math.random() * 4)]
      const isHighlighted = i % 10 === 0
      return {
        id: `img-${i}`,
        text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
        imageSelection: 'postcard_1',
        isHighlighted,
        imageUrl,
      }
    })
  }, [])

  return { _state: 'LOADED', postcards }
}
