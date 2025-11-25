import {
  OnboardingFormatsDocument,
  UpdateNewsletterSubscriptionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import { useTranslation } from '../../../lib/withT'
import { Button } from '../ui/button'
import { FORMATS_FEATURED } from './config'
import { OnboardingH3 } from './onboarding-ui'

function FollowButton({
  onClick,
  subscribed,
  isPending,
}: {
  onClick: () => void
  subscribed?: boolean
  isPending?: boolean
}) {
  return (
    <Button
      variant='link'
      className={css({ fontWeight: 500, textDecoration: 'none' })}
      onClick={onClick}
    >
      + Folgen
    </Button>
  )
}

function FormatCard({ format }: { format: string }) {
  const { t } = useTranslation()
  const [updateNewsletterSubscription] = useMutation(
    UpdateNewsletterSubscriptionDocument,
  )
  const [isPending, setIsPending] = useState(false)

  async function toggleSubscription() {
    if (isPending) return

    setIsPending(true)
    await updateNewsletterSubscription({
      variables: {
        name: format,
        subscribed: !subscribed,
      },
    })
    setIsPending(false)
  }

  return (
    <div
      className={css({
        flex: '0 0 280px',
        scrollSnapAlign: 'start',
        height: '280px',
        backgroundColor: 'background.marketing',
        textAlign: 'center',
        mx: 2,
        px: 4,
        py: 6,
        display: 'flex',
        flexDirection: 'column',
      })}
      onClick={toggleSubscription}
      role='button'
    >
      <img
        width='84'
        src='https://www.republik.ch/_next/image?url=https%3A%2F%2Fcdn.repub.ch%2Fs3%2Frepublik-assets%2Fportraits%2F9e26dc51867ec05a944b4ff4bcfba835.jpeg%3Fsize%3D750x1334%26resize%3D384x384%26bw%3D1%26format%3Dauto&w=640&q=75'
        alt='authors portrait'
        className={css({ borderRadius: '100px', mx: 'auto', pb: 4 })}
      />
      <p className={css({ fontSize: 'l', letterSpacing: '-0.11' })}>
        {t(`onboarding/formats/${format}/author`)}
      </p>
      <h4
        className={css({
          fontFamily: 'gtAmericaStandard',
          fontWeight: 'bold',
          fontSize: 'l',
          lineHeight: 1.2,
          mt: 2,
        })}
      >
        {t(`onboarding/formats/${format}/description`)}
      </h4>
      <div style={{ marginTop: 'auto' }}>
        <FollowButton onClick={toggleSubscription} />
      </div>
    </div>
  )
}

function FormatsSection() {
  const { data } = useQuery(OnboardingFormatsDocument)
  const subscriptions = data?.sections.nodes
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
        {FORMATS_FEATURED.map((format) => (
          <FormatCard key={format} format={format} />
        ))}
      </div>
    </section>
  )
}

export default FormatsSection
