import { ColorContextProvider } from '@project-r/styleguide'

import { useInNativeApp } from '../../lib/withInNativeApp'
import UserGuidance from '../Account/UserGuidance'
import ErrorMessage from '../ErrorMessage'
import MarketingTrialForm from './MarketingTrialForm'
import { MainContainer } from '../Frame'

import Top from './Top'
import Carpet from './Carpet'
import Team from './Team'
import Reasons from './Reasons'
import Formats from './Formats'
import Vision from './Vision'
import Logo from './Logo'
import Community from './Community'
import SectionContainer from './Common/SectionContainer'
import ChallengeAcceptedMarketingTeaser from '../ChallengeAccepted/ChallengeAcceptedMarketingTeaser'
import { useMe } from '../../lib/context/MeContext'
// CAMPAIGN MODE
// import { TrialPaynote } from '@app/app/(campaign)/components/trial-paynote'

const Marketing = ({ data }) => {
  const { inNativeApp, inNativeIOSApp } = useInNativeApp()
  const { me, meLoading, meError, hasActiveMembership } = useMe()

  return (
    <>
      {me && !meLoading && !hasActiveMembership && !inNativeIOSApp && (
        <div
          style={{
            paddingTop: 30,
            paddingBottom: 30,
          }}
        >
          <MainContainer>
            <UserGuidance />
          </MainContainer>
        </div>
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
        employees={data.employees}
        title={data.sectionTeamTitle}
        description={data.sectionTeamDescription}
      />
      <Community featuredComments={data.featuredComments} />
      <Vision />
      {inNativeApp && <MarketingTrialForm />}
      <Logo />
    </>
  )
}

export default Marketing
