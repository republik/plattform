import { FrontDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { RenderFront } from 'components/Front'
import { createGetStaticProps } from 'lib/apollo/helpers'
import { useSearchParams } from 'next/navigation'

type Props = {
  front: any
}

export default function FrontPage({ front }: Props) {
  const searchParams = useSearchParams()

  const extractId = searchParams.get('extractId')

  if (!extractId) {
    return null
  }

  return (
    <RenderFront
      front={front}
      nodes={front.children.nodes.filter((node) => node.id === extractId)}
      isFrontExtract
    />
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
