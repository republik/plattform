import { withDefaultSSR } from '../../../lib/apollo/helpers'
import { gql, useQuery } from '@apollo/client'
import { FigureImage } from '@project-r/styleguide'
import { CDN_FRONTEND_BASE_URL } from '../../../lib/constants'

import AssetImage from '../../../lib/images/AssetImage'

import { css } from 'glamor'
import { useMemo } from 'react'

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

// deprecated?
// type ImageSrcData = {
//   src: string
//   dark: null
//   srcSet: string
//   maxWidth: number
//   size: { width: number; height: number }
// }

type Postcard = {
  id: string
  text: string
  isHighlighted: boolean
  imageUrl: string
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
const usePostcardsData = (): PostcardsData => {
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

    const image = FigureImage.utils.getResizedSrcs(
      `${CDN_FRONTEND_BASE_URL}${imageUrl}?size=1500x1057`, // FIXME: use correct/consistent size for all images
      undefined,
      1500,
    )

    return {
      id: submission.id,
      text,
      image,
    }
  })

  return { _state: 'LOADED', postcards }
}

const useMockPostcardsData = (): PostcardsData => {
  const images = [
    '/static/climatelab/freier.jpg',
    '/static/climatelab/farner.jpg',
    '/static/climatelab/richardson.jpg',
    '/static/climatelab/zalko.jpg',
  ]

  const postcards = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const imageUrl = images[Math.floor(Math.random() * 4)]
      const isHighlighted = Math.random() < 0.2
      return {
        id: `img-${i}`,
        text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
        isHighlighted,
        imageUrl,
      }
    })
  }, [])

  return { _state: 'LOADED', postcards }
}

const gridStyles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gridTemplateRows: 'auto',
    gridAutoFlow: 'row dense',
    gap: '1rem',
  }),
  card: css({
    background: 'black',
    width: '100%',
  }),
  highlightedCard: css({
    background: 'black',
    width: '100%',
    // border: '2px solid pink',
    gridRowEnd: 'span 2',
    gridColumnEnd: 'span 2',
  }),
}

const PostcardsGrid = ({ postcards }: { postcards: Postcard[] }) => {
  return (
    <div {...gridStyles.container}>
      {postcards.map((p) => {
        const cardStyle = p.isHighlighted
          ? gridStyles.highlightedCard
          : gridStyles.card
        return (
          <div key={p.id} {...cardStyle}>
            {/* {p.text} */}
            <AssetImage width='600' height='420' src={p.imageUrl} />
          </div>
        )
      })}
    </div>
  )
}

function PostcardGallery() {
  // const postcardsData = usePostcardsData()
  const postcardsData = useMockPostcardsData()

  return postcardsData._state === 'LOADED' ? (
    <PostcardsGrid postcards={postcardsData.postcards} />
  ) : (
    <div>whoops</div>
  )
}

export default withDefaultSSR(PostcardGallery)
