import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

import withT from '../../lib/withT'
import { useInNativeApp } from '../../lib/withInNativeApp'
import UserGuidance from '../Account/UserGuidance'
import ErrorMessage from '../ErrorMessage'
import MarketingTrialForm from './MarketingTrialForm'
import { MainContainer } from '../Frame'
import Box from '../Frame/Box'

import Lead from './Lead'
import Carpet from './Carpet'
import Team from './Team'
import Reasons from './Reasons'
import Sections from './Sections'
import Vision from './Vision'
import Logo from './Logo'
import MiniFront from './MiniFront'
import Community from './Community'
import Pledge from './Pledge'

const Marketing = ({ t, data: { loading, error, meGuidance } }) => {
  const hasActiveMembership = meGuidance && !!meGuidance.activeMembership
  const { inNativeApp, inNativeIOSApp } = useInNativeApp()
  return (
    <>
      {!loading && meGuidance && !hasActiveMembership && !inNativeIOSApp && (
        <Box>
          <MainContainer>
            <UserGuidance />
          </MainContainer>
        </Box>
      )}
      {error && <ErrorMessage error={error} style={{ textAlign: 'center' }} />}
      <Lead t={t} />
      <MiniFront t={t} />
      <Carpet t={t} />
      <Reasons t={t} inNativeApp={inNativeApp} />
      {inNativeApp && <MarketingTrialForm t={t} />}
      <Sections t={t} />
      <Team t={t} />
      <Community t={t} />
      <Vision t={t} />
      {inNativeApp ? <MarketingTrialForm t={t} /> : <Pledge />}
      <Logo />
    </>
  )
}

const query = gql`
  query Marketing {
    meGuidance: me {
      id
      activeMembership {
        id
      }
      accessGrants {
        id
      }
    }
  }
`

export default compose(withT, graphql(query))(Marketing)
