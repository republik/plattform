import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'
import { CDN_FRONTEND_BASE_URL } from '../../../lib/constants'

/**
 * TODO: Resolve user profiles for linked
 * TODO: How does pagination work here?
 * TODO: Replace getResizedSrcs with new AssetImage
 *
 */

const POSTCARDS_QUERY = gql`
  query publicPostcardsQuery {
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

      submissions {
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

/**
 *
 * TODO: Proper loading/error state
 *
 */
export const usePostcardsData = (): PostcardsData => {
  const { data, loading, error } = useQuery(POSTCARDS_QUERY)

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
  const postcards = data.questionnaire?.submissions?.nodes.map((submission) => {
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
  })

  return { _state: 'LOADED', postcards }
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
