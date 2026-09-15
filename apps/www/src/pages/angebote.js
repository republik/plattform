import { Component } from 'react'
import { withRouter } from 'next/router'

import { NarrowContainer } from '@project-r/styleguide'

import Frame, { Content } from '@/components/Frame'
import PledgeForm from '@/components/Pledge/Form'
import PledgeReceivePayment from '@/components/Pledge/ReceivePayment'

import { PSP_PLEDGE_ID_QUERY_KEYS } from '@/components/Payment/constants'
import {
  createGetServerSideProps,
  providedUserAgentProps,
} from '@/lib/apollo/helpers'

// `goto` is set by campaign links and payment slips handed out externally
const GOTO_DESTINATIONS = {
  cockpit: '/cockpit',
  crowdfunding2: '/maerzkampagne',
  account: '/konto',
}

class PledgePage extends Component {
  render() {
    const { router } = this.props

    const { query } = router
    const queryKey = PSP_PLEDGE_ID_QUERY_KEYS.find((key) => query[key])
    const pledgeId = queryKey && query[queryKey].split('_')[0]

    return (
      <Frame raw>
        <NarrowContainer>
          <Content>
            {pledgeId ? (
              <PledgeReceivePayment pledgeId={pledgeId} query={query} />
            ) : (
              <PledgeForm query={query} />
            )}
          </Content>
        </NarrowContainer>
      </Frame>
    )
  }
}

export default withRouter(PledgePage)

export const getServerSideProps = createGetServerSideProps(async ({ ctx }) => {
  const { query, req } = ctx
  const destination = GOTO_DESTINATIONS[query.goto]

  if (destination) {
    return {
      redirect: {
        destination: `${destination}${
          query.token ? `?token=${query.token}` : ''
        }${query.hash ? `#${query.hash}` : ''}`,
        permanent: false,
      },
    }
  }

  return { props: providedUserAgentProps(req) }
})
