import { useRouter } from 'next/router'

import PledgeForm from '../Pledge/Form'
import SectionContainer from './Common/SectionContainer'

const MarketingProducts = () => {
  const { query } = useRouter()

  return (
    <SectionContainer maxWidth={720}>
      <PledgeForm
        preventMetaUpdate // Form should not call <Meta />
        query={query}
      />
    </SectionContainer>
  )
}

export default MarketingProducts
