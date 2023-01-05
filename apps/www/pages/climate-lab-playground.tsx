import { withDefaultSSR } from '../lib/apollo/helpers'
import { gql, useQuery } from '@apollo/client'
import { FigureImage } from '@project-r/styleguide'
import { CDN_FRONTEND_BASE_URL } from '../lib/constants'
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

const PostcardsGrid = ({ postcards }: { postcards: Postcard[] }) => {
  console.log(postcards)

  return (
    <div>
      {postcards.map((p) => {
        return (
          <div key={p.id}>
            {p.text}
            <img {...p.image} />
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
