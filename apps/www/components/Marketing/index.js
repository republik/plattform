import { ColorContextProvider } from '@project-r/styleguide'
import { useMe } from '../../lib/context/MeContext'

import { useInNativeApp } from '../../lib/withInNativeApp'
import UserGuidance from '../Account/UserGuidance'
import ChallengeAcceptedMarketingTeaser from '../ChallengeAccepted/ChallengeAcceptedMarketingTeaser'
import ErrorMessage from '../ErrorMessage'
import { MainContainer } from '../Frame'
import Carpet from './Carpet'
import SectionContainer from './Common/SectionContainer'
import Community from './Community'
import Formats from './Formats'
import Logo from './Logo'
import MarketingTrialForm from './MarketingTrialForm'
import Reasons from './Reasons'
import Team from './Team'

import Top from './Top'
import Vision from './Vision'
// CAMPAIGN MODE
// import { TrialPaynote } from '@app/app/(campaign)/components/trial-paynote'

const Marketing = ({ data }) => {
  const { inNativeApp } = useInNativeApp()
  const { me, meLoading, meError, hasActiveMembership } = useMe()

  return (
    <>
      {me && !meLoading && !hasActiveMembership && (
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
