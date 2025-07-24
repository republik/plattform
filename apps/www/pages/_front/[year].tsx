import {
  FrontDocument,
  FrontsDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { RenderFront } from 'components/Front'
import { createGetStaticPaths, createGetStaticProps } from 'lib/apollo/helpers'
import { GetStaticPaths } from 'next'
import { useSearchParams } from 'next/navigation'

type Params = {
  year: string
}

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

export const getStaticPaths: GetStaticPaths<Params> = createGetStaticPaths(
  async (client) => {
    const res = await client.query({
      query: FrontsDocument,
    })

    if (!res.data?.fronts) {
      throw new Error('No Front Documents found')
    }

    return {
      fallback: false,
      paths: res.data.fronts.nodes.flatMap(({ meta }) => {
        if (meta.slug) {
          return [{ params: { year: meta.slug } }]
        }
        return []
      }),
    }
  },
)

export const getStaticProps = createGetStaticProps(
  async (client, { params }) => {
    const res = await client.query({
      query: FrontDocument,
      variables: { path: `/${params.year}` },
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
    }
  },
)
