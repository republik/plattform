'use client'

import {
  Document,
  OnboardingFormatsDocument,
  SubscriptionObjectType,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { OnboardingFollowButton } from '@app/components/onboarding/follow-button'
import { css } from '@republik/theme/css'
import { useTranslation } from '../../../lib/withT'
import { FORMATS_FEATURED, FORMATS_STYLE } from './config'
import { OnboardingH3, OnboardingSection } from './onboarding-ui'
import Image from 'next/image'

function FormatCard({ format }: { format?: Document }) {
  const { t } = useTranslation()

  if (!format) return null

  const subscriptionId = format.subscribedBy.nodes.find((n) => n.active)?.id

  return (
    <div
      className={css({
        flex: '0 0 280px',
        scrollSnapAlign: 'start',
        height: '315px',
        mx: 2,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        md: {
          mx: 'initial',
        },
      })}
      style={FORMATS_STYLE[format.repoId] || {}}
    >
      <h4
        className={css({
          fontFamily: 'republikSerif',
          fontSize: '2xl',
          lineHeight: 1,
          letterSpacing: -0.02,
          pb: 2,
        })}
      >
        {t(`onboarding/formats/${format.repoId}/description`)}
      </h4>
      <p className={css({ fontSize: 'l', letterSpacing: '-0.11' })}>
        Von {t(`onboarding/formats/${format.repoId}/author`)}
      </p>
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'end',
        }}
      >
        <OnboardingFollowButton
          subscriptionId={subscriptionId}
          objectId={format.id}
          type={SubscriptionObjectType.Document}
        />
        <Image
          className={css({ maxHeight: '160px', maxWidth: '120px' })}
          src={FORMATS_STYLE[format.repoId]?.imageSrc}
          alt='' // Decorative images don't need alt text
        />
      </div>
    </div>
  )
}

function FormatsSection() {
  const { t } = useTranslation()
  const { data } = useQuery(OnboardingFormatsDocument, {
    variables: { repoIds: FORMATS_FEATURED },
  })

  const formats = data?.documents.nodes as Document[]

  if (!formats?.length) return null

  return (
    <OnboardingSection>
      <OnboardingH3>{t('onboarding/formats/title')}</OnboardingH3>
      <div
        className={css({
          display: 'flex',
          overflowX: 'scroll',
          scrollSnapType: 'x mandatory',
          pb: 4,
          md: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 4,
          },
        })}
      >
        {FORMATS_FEATURED.map((repoId) => (
          <FormatCard
            key={repoId}
            format={formats.find((format) => format.repoId === repoId)}
          />
        ))}
      </div>
    </OnboardingSection>
  )
}

export default FormatsSection
