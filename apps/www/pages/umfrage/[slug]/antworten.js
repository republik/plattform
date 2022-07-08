import { createGetStaticProps } from '../../../lib/apollo/helpers'
import Frame from '../../../components/Frame'
import Submissions, {
  mainQuery,
} from '../../../components/Questionnaire/Submissions'

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

const REVALIDATE_SECONDS = 60

export const getStaticProps = createGetStaticProps(
  async (client, { params }) => {
    const {
      data: { questionnaire },
    } = await client.query({
      query: mainQuery,
      variables: {
        slug: params.slug,
      },
    })

    if (questionnaire) {
      return {
        props: {},
        revalidate: REVALIDATE_SECONDS,
      }
    }

    return {
      notFound: true,
      revalidate: REVALIDATE_SECONDS,
    }
  },
)

const AnswerPage = () => {
  return (
    <Frame>
      <Submissions />
    </Frame>
  )
}

export default AnswerPage
