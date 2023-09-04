import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { ColorContextProvider } from '@project-r/styleguide'

import { useInNativeApp } from '../../lib/withInNativeApp'
import UserGuidance from '../Account/UserGuidance'
import ErrorMessage from '../ErrorMessage'
import MarketingTrialForm from './MarketingTrialForm'
import { MainContainer } from '../Frame'
import Box from '../Frame/Box'

import Top from './Top'
import Carpet from './Carpet'
import Team from './Team'
import Reasons from './Reasons'
import Sections from './Sections'
import Vision from './Vision'
import Logo from './Logo'
import Community from './Community'
import Pledge from './Pledge'
import { useMarketingPageQuery } from './graphql/MarketingPageQuery.graphql'

const Marketing = ({
  data: { loading: meLoading, error: meError, meGuidance },
}) => {
  const hasActiveMembership = meGuidance && !!meGuidance.activeMembership
  const { inNativeApp, inNativeIOSApp } = useInNativeApp()

  const { data, loading, error } = useMarketingPageQuery()

  return (
    <>
      {!meLoading && meGuidance && !hasActiveMembership && !inNativeIOSApp && (
        <Box>
          <MainContainer>
            <UserGuidance />
          </MainContainer>
        </Box>
      )}
      {meError && (
        <ErrorMessage error={meError} style={{ textAlign: 'center' }} />
      )}
      <ColorContextProvider colorSchemeKey='dark'>
        <Top carouselData={data.carousel} />
      </ColorContextProvider>
      <Carpet loading={loading} front={data.carpet} />
      <Reasons inNativeApp={inNativeApp} />
      {inNativeApp && <MarketingTrialForm />}
      <Sections />
      <Team loading={loading} error={error} employees={data.team} />
      <Community
        loading={loading}
        error={error}
        featuredComments={data.featuredComments}
      />
      <Vision />
      {inNativeApp ? <MarketingTrialForm /> : <Pledge />}
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

export default compose(graphql(query))(Marketing)
