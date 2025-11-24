import { css } from '@republik/theme/css'
import { OnboardingH3 } from './onboarding-ui'

function AuthorCard() {
  return <div>Adrienne</div>
}

function AuthorsSection() {
  return (
    <section className={css({ pt: 4 })}>
      <OnboardingH3>Unsere Autorinnen</OnboardingH3>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        })}
      >
        <AuthorCard />
        <AuthorCard />
        <AuthorCard />
      </div>
    </section>
  )
}

export default AuthorsSection
