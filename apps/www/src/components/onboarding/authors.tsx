import { css } from '@republik/theme/css'
import AuthorsSection from './authors-section'
import OnboardingHeader from './onboarding-header'
import { OnboardingNextStep } from './onboarding-ui'
import PerspectivesSection from './persectives-section'
import PodcastsSection from './podcasts-section'

function OnboardingAuthors() {
  return (
    <>
      <div className={css({ p: 6 })}>
        <OnboardingHeader>
          <h2>Tipp 2 von 2</h2>
          <h1>Folgen Sie Stimmen, die Sie interessieren</h1>
          <p>Wir informieren Sie per E-Mail über neue Beiträge.</p>
        </OnboardingHeader>

        <PerspectivesSection />
        <AuthorsSection />
        <PodcastsSection />
      </div>

      <OnboardingNextStep href='/onboarding/jetzt-aber' />
    </>
  )
}

export default OnboardingAuthors
