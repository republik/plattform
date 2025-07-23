import { FrontDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { RenderFront } from 'components/Front'
import { createGetStaticProps } from 'lib/apollo/helpers'

type Props = {
  front: any
}

export default function FrontPage({ front }: Props) {
  return (
    <RenderFront front={front} nodes={front.children.nodes} isFrontExtract />
  )
}

export const getStaticProps = createGetStaticProps(async (client) => {
  const res = await client.query({
    query: FrontDocument,
    variables: { path: `/` },
  })

  if (!res.data.front) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      front: res.data?.front,
    },
    revalidate: 3_600, // once per hour
  }
})
