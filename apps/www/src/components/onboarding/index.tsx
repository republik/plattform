import { css } from '@republik/theme/css'
import NewsletterSection from './newsletter-section'
import OnboardingHeader from './onboarding-header'

function Onboarding() {
  return (
    <div className={css({ p: 6 })}>
      <OnboardingHeader>
        <h2>Tipp 1 von 2</h2>
        <h1>Lassen Sie sich die Republik ins Postfach liefern</h1>
        <p>Welche Newsletter möchten Sie erhalten?</p>
      </OnboardingHeader>

      <NewsletterSection title='Beliebteste' />
      <NewsletterSection title='Was für Sie?' />

      <div>
        <p>Ändern im Konto jederzeit möglich.</p>
        <button>Weiter</button>
      </div>
    </div>
  )
}

export default Onboarding
