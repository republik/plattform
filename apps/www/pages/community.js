import { useRouter } from 'next/router'
import Frame from '../components/Frame'
import List, { generateSeed } from '../components/Testimonial/List'
import Share from '../components/Testimonial/Share'
import TV from '../components/Testimonial/TV'
import Image from '../components/Testimonial/Image'
import { createGetStaticProps } from '../lib/apollo/helpers'

const CommunityPage = ({ serverContext, seed }) => {

  const { query } = useRouter()

  if (query.share) {
    return <Share focus={query.share} pkg={query.package} />
  }

  if (query.tv) {
    return <TV duration={+Math.max(1000, query.duration || 30000)} />
  }

  if (query.img) {
    const order = query.order || 'ASC'
    const defaultSequenceNumber = order === 'DESC' ? Math.pow(10, 6) : 0
    return (
      <Image
        query={query}
        sequenceNumber={+query.sequenceNumber || defaultSequenceNumber}
        orderDirection={order}
        duration={+Math.max(1000, query.duration || 5000)}
      />
    )
  }

  return (
    <Frame>
      <List seed={seed} id={query.id} isPage serverContext={serverContext} />
    </Frame>
  )
}

export default CommunityPage

export const getStaticProps = createGetStaticProps(
  async (client, { draftMode }) => {
    return {
      props: {
        seed: generateSeed(),
      },
    }
  },
)
