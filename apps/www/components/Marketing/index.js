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
import Formats from './Formats'
import Vision from './Vision'
import Logo from './Logo'
import Community from './Community'
import MarketingProducts from './MarketingProducts'
import SectionContainer from './Common/SectionContainer'
import ChallengeAcceptedMarketingTeaser from '../ChallengeAccepted/ChallengeAcceptedMarketingTeaser'

// CAMPAIGN MODE
// import { TrialPaynote } from '@app/app/(campaign)/components/trial-paynote'

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
      {/* 
      
      CAMPAIGN MODE
      <TrialPaynote variant='marketing' /> 
      
      */}
      <ColorContextProvider colorSchemeKey='dark'>
        <Top carouselData={data.carousel} />
      </ColorContextProvider>
      <Carpet front={data.carpet} />
      <Reasons inNativeApp={inNativeApp} reasons={data.reasons} />
      {inNativeApp && <MarketingTrialForm />}
      <SectionContainer maxWidth={'100%'} padding='0'>
        <ChallengeAcceptedMarketingTeaser />
      </SectionContainer>
      <Formats
        formats={data.formats}
        title={data.sectionFormatsTitle}
        description={data.sectionFormatsDescription}
      />
      <Team
        employees={data.team}
        title={data.sectionTeamTitle}
        description={data.sectionTeamDescription}
      />
      <Community featuredComments={data.featuredComments} />
      <Vision />
      {inNativeApp ? <MarketingTrialForm /> : <MarketingProducts />}
      <Logo />
    </>
  )
}

export default Marketing
