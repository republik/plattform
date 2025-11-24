import { css } from '@republik/theme/css'
import { OnboardingH3 } from './onboarding-ui'

function PodcastCard() {
  return <div>Dritte Gewalt</div>
}

function PodcastsSection() {
  return (
    <section className={css({ pt: 4 })}>
      <OnboardingH3>Podcasts und Audioserien</OnboardingH3>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        })}
      >
        <PodcastCard />
        <PodcastCard />
        <PodcastCard />
      </div>
    </section>
  )
}

export default PodcastsSection
