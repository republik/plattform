import { useRouter } from 'next/router'
import { CROWDFUNDING_PLEDGE } from '../../lib/constants'

import PledgeForm from '../Pledge/Form'
import SectionContainer from './Common/SectionContainer'

const MarketingProducts = () => {
  const { query } = useRouter()

  return (
    <SectionContainer maxWidth={720}>
      <PledgeForm
        preventMetaUpdate // Form should not call <Meta />
        crowdfundingName={CROWDFUNDING_PLEDGE}
        query={query}
      />
    </SectionContainer>
  )
}

export default MarketingProducts
