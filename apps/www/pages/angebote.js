import { Component } from 'react'
import { withRouter } from 'next/router'

import { Interaction, NarrowContainer } from '@project-r/styleguide'

import { CROWDFUNDING_PLEDGE } from '../lib/constants'

import Frame, { Content } from '../components/Frame'
import PledgeForm from '../components/Pledge/Form'
import PledgeReceivePayment from '../components/Pledge/ReceivePayment'

import { PSP_PLEDGE_ID_QUERY_KEYS } from '../components/Payment/constants'
import { withDefaultSSR } from '../lib/apollo/helpers'
import Blocker from '../components/NativeApp/Blocker'

class PledgePage extends Component {
  render() {
    const { router, serverContext } = this.props

    const { query } = router
    const queryKey = PSP_PLEDGE_ID_QUERY_KEYS.find((key) => query[key])
    const pledgeId = queryKey && query[queryKey].split('_')[0]

    if (query.goto === 'cockpit') {
      if (serverContext) {
        serverContext.res.redirect(
          302,
          `/cockpit${query.token ? `?token=${query.token}` : ''}${
            query.hash ? `#${query.hash}` : ''
          }`,
        )
        throw new Error('redirect')
      } else if (process.browser) {
        // SSR does two two-passes: data (with serverContext) & render (without)
        router.replace({ pathname: '/cockpit', query: { token: query.token } })
      }
    }
    if (query.goto === 'crowdfunding2') {
      if (serverContext) {
        serverContext.res.redirect(
          302,
          `/maerzkampagne${query.token ? `?token=${query.token}` : ''}${
            query.hash ? `#${query.hash}` : ''
          }`,
        )
        throw new Error('redirect')
      } else if (process.browser) {
        // SSR does two two-passes: data (with serverContext) & render (without)
        router.replace({
          pathname: '/maerzkampagne',
          query: { token: query.token },
        })
      }
    }
    if (query.goto === 'account') {
      if (serverContext) {
        serverContext.res.redirect(
          302,
          `/konto${query.token ? `?token=${query.token}` : ''}${
            query.hash ? `#${query.hash}` : ''
          }`,
        )
        throw new Error('redirect')
      } else if (process.browser) {
        // SSR does two two-passes: data (with serverContext) & render (without)
        router.replace({ pathname: '/konto', query: { token: query.token } })
      }
    }

    return (
      <Frame raw>
        <NarrowContainer>
          <Content>
            <Blocker>
              {pledgeId ? (
                <PledgeReceivePayment
                  crowdfundingName={CROWDFUNDING_PLEDGE}
                  pledgeId={pledgeId}
                  query={query}
                />
              ) : (
                <PledgeForm
                  crowdfundingName={CROWDFUNDING_PLEDGE}
                  query={query}
                />
              )}
            </Blocker>
          </Content>
        </NarrowContainer>
      </Frame>
    )
  }
}

export default withDefaultSSR(withRouter(PledgePage))
