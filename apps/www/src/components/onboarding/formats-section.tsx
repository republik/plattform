import {
  Document,
  OnboardingFormatsDocument,
  SubToDocDocument,
  UnSubFromDocDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import { useTranslation } from '../../../lib/withT'
import { FORMATS_FEATURED } from './config'
import { OnboardingFollowButton, OnboardingH3 } from './onboarding-ui'

function FormatCard({ format }: { format: Document }) {
  const { t } = useTranslation()
  const [subToDoc] = useMutation(SubToDocDocument)
  const [unSubFromDoc] = useMutation(UnSubFromDocDocument)
  const [isPending, setIsPending] = useState(false)

  const subscriptionId = format.subscribedBy.nodes.find((n) => n.active)?.id

  async function toggleSubscription(e) {
    e.stopPropagation()

    if (isPending) return

    setIsPending(true)
    if (subscriptionId) {
      await unSubFromDoc({
        variables: {
          subscriptionId,
        },
      })
    } else {
      await subToDoc({
        variables: {
          documentId: format.id,
        },
      })
    }
    setIsPending(false)
  }

  return (
    <div
      className={css({
        flex: '0 0 280px',
        scrollSnapAlign: 'start',
        height: '280px',
        backgroundColor: 'background.marketing',
        mx: 2,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
      })}
      onClick={toggleSubscription}
      role='button'
    >
      <h4
        className={css({
          fontFamily: 'republikSerif',
          fontSize: '2xl',
          lineHeight: 1,
          letterSpacing: -0.02,
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
          onClick={toggleSubscription}
          subscribed={!!subscriptionId}
          isPending={isPending}
        />
        <img width='120' src={format.meta.audioCover} alt='cover image' />
      </div>
    </div>
  )
}

function FormatsSection() {
  const { data } = useQuery(OnboardingFormatsDocument, {
    variables: { repoIds: FORMATS_FEATURED },
  })

  const formats = data?.documents.nodes as Document[]

  if (!formats?.length) return null

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
        {FORMATS_FEATURED.map((repoId) => (
          <FormatCard
            key={repoId}
            format={formats.find((format) => format.repoId === repoId)}
          />
        ))}
      </div>
    </section>
  )
}

export default FormatsSection
