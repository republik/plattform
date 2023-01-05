import { withDefaultSSR } from '../lib/apollo/helpers'
import { gql, useQuery } from '@apollo/client'
import { FigureImage } from '@project-r/styleguide'
import { CDN_FRONTEND_BASE_URL } from '../lib/constants'

import { css } from 'glamor'

/**
 * TODO: Filter out submissions which are not public
 * TODO: Resolve user profiles for linked
 * TODO: How does pagination work here?
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

type ImageSrcData = {
  src: string
  dark: null
  srcSet: string
  maxWidth: number
  size: { width: number; height: number }
}

type Postcard = {
  id: string
  text: string
  image: ImageSrcData
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
      `${CDN_FRONTEND_BASE_URL}${imageUrl}?size=1330x943`, // FIXME: use correct/consistent size for all images
      undefined,
      300,
    )

    return {
      id: submission.id,
      text,
      image,
    }
  })

  return { _state: 'LOADED', postcards }
}

const gridStyles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(200px, 1fr))',
    gridTemplateRows: 'auto',
    gap: '1rem',
  }),
  card: css({
    width: '100%',
  }),
}

const PostcardsGrid = ({ postcards }: { postcards: Postcard[] }) => {
  return (
    <div {...gridStyles.container}>
      {postcards.map((p) => {
        return (
          <div key={p.id} {...gridStyles.card}>
            {/* {p.text} */}
            <img style={{ width: '100%' }} {...p.image} />
          </div>
        )
      })}
    </div>
  )
}

function PlaygroundPage() {
  const postcardsData = usePostcardsData()

  return postcardsData._state === 'LOADED' ? (
    <PostcardsGrid postcards={postcardsData.postcards} />
  ) : (
    <div>whoops</div>
  )
}

export default withDefaultSSR(PlaygroundPage)
