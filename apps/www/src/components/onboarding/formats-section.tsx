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

  async function toggleSubscription() {
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
        src={format.meta.audioCover}
        alt='formats image'
        className={css({ borderRadius: '100px', mx: 'auto', pb: 4 })}
      />
      <p className={css({ fontSize: 'l', letterSpacing: '-0.11' })}>
        {t(`onboarding/formats/${format.repoId}/author`)}
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
        {t(`onboarding/formats/${format.repoId}/description`)}
      </h4>
      <div style={{ marginTop: 'auto' }}>
        <OnboardingFollowButton
          onClick={toggleSubscription}
          subscribed={!!subscriptionId}
          isPending={isPending}
        />
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
