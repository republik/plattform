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
import ClimateLabTeaser from '../Climatelab/FrontTeaser/ClimateLabTeaser'
import SectionContainer from './Common/SectionContainer'

const Marketing = ({
  data: { loading: meLoading, error: meError, meGuidance },
}) => {
  const hasActiveMembership = meGuidance && !!meGuidance.activeMembership
  const hasSpecialAccessGrants = meGuidance?.accessGrants?.filter(
    (grant) => grant.campaign.type === 'REDUCED',
  ).length
  const { inNativeApp, inNativeIOSApp } = useInNativeApp()

  const { data, loading, error } = useMarketingPageQuery()

  return (
    <>
      {/* TODO: as soon as we do not have member role for climate users only
      should we display another box for climate users or should we just not 
      display it like it's done here */}
      {!meLoading &&
        meGuidance &&
        !hasActiveMembership &&
        !hasSpecialAccessGrants &&
        !inNativeIOSApp && (
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
      <SectionContainer maxWidth={'100%'} padding='0'>
        <ClimateLabTeaser />
      </SectionContainer>
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
        campaign {
          type
        }
      }
    }
  }
`

export default compose(graphql(query))(Marketing)
