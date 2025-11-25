import { css } from '@republik/theme/css'
import AuthorsSection from './authors-section'
import FormatsSection from './formats-section'
import OnboardingHeader from './onboarding-header'
import { OnboardingNextStep } from './onboarding-ui'
import PodcastsSection from './podcasts-section'

function OnboardingFollow() {
  return (
    <>
      <div className={css({ px: 4, py: 6 })}>
        <OnboardingHeader>
          <h2>Tipp 2 von 2</h2>
          <h1>Folgen Sie Stimmen, die Sie interessieren</h1>
          <p>Wir informieren Sie per E-Mail über neue Beiträge.</p>
        </OnboardingHeader>

        <FormatsSection />
        <AuthorsSection />
        <PodcastsSection />
      </div>

      <OnboardingNextStep href='/onboarding/jetzt-aber' />
    </>
  )
}

export default OnboardingFollow
