import { css } from '@republik/theme/css'
import { OnboardingH3 } from './onboarding-ui'

function PerspectiveCard() {
  return <div>Anna Rosenwasser</div>
}

function PerspectivesSection() {
  return (
    <section className={css({ pt: 4 })}>
      <OnboardingH3>Perspektiven mit Haltung</OnboardingH3>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        })}
      >
        <PerspectiveCard />
        <PerspectiveCard />
        <PerspectiveCard />
      </div>
    </section>
  )
}

export default PerspectivesSection
