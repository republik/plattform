import { css } from '@republik/theme/css'
import { OnboardingH3 } from './onboarding-ui'

function PerspectiveCard() {
  return (
    <div
      className={css({
        flex: '0 0 280px',
        scrollSnapAlign: 'start',
        height: '280px',
        backgroundColor: 'background.marketing',
        textAlign: 'center',
        mx: 2,
        p: 4,
        '&:first-child': { ml: 'auto' },
        '&:last-child': { mr: 'auto' },
      })}
    >
      <img
        width='84'
        src='https://www.republik.ch/_next/image?url=https%3A%2F%2Fcdn.repub.ch%2Fs3%2Frepublik-assets%2Fportraits%2F9e26dc51867ec05a944b4ff4bcfba835.jpeg%3Fsize%3D750x1334%26resize%3D384x384%26bw%3D1%26format%3Dauto&w=640&q=75'
        alt='authors portrait'
        className={css({ borderRadius: '100px', mx: 'auto', pb: 4 })}
      />
      <p className={css({ fontSize: 'l', letterSpacing: '-0.11' })}>
        Anna Rosenwasser
      </p>
      <h4
        className={css({
          fontFamily: 'gtAmericaStandard',
          fontWeight: 'bold',
          fontSize: 'l',
          lineHeight: 1.2,
        })}
      >
        Der queere Blick unter die Oberfläche
      </h4>
    </div>
  )
}

function PerspectivesSection() {
  return (
    <section className={css({ pt: 4 })}>
      <OnboardingH3>Perspektiven mit Haltung</OnboardingH3>
      <div
        className={css({
          display: 'flex',
          overflowX: 'scroll',
          scrollSnapType: 'x mandatory',
          pb: 4,
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
