import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql, useQuery } from '@apollo/client'
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
import SectionContainer from './Common/SectionContainer'
import ChallengeAcceptedMarketingTeaser from '../ChallengeAccepted/ChallengeAcceptedMarketingTeaser'

const meGuidanceQuery = gql`
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

const Marketing = ({ data }) => {
  const {
    loading: meLoading,
    error: meError,
    data: meData,
  } = useQuery(meGuidanceQuery)
  const hasActiveMembership = !!meData?.meGuidance?.activeMembership
  const { inNativeApp, inNativeIOSApp } = useInNativeApp()

  return (
    <>
      {!meLoading &&
        meData?.meGuidance &&
        !hasActiveMembership &&
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
      <Carpet front={data.carpet} />
      <Reasons inNativeApp={inNativeApp} reasons={data.pitches} />
      {inNativeApp && <MarketingTrialForm />}
      <SectionContainer maxWidth={'100%'} padding='0'>
        <ChallengeAcceptedMarketingTeaser />
      </SectionContainer>
      <Sections />
      <Team employees={data.team} />
      <Community featuredComments={data.featuredComments} />
      <Vision />
      {inNativeApp ? <MarketingTrialForm /> : <Pledge />}
      <Logo />
    </>
  )
}

export default Marketing
