import { SubscriptionObjectType } from '#graphql/republik-api/__generated__/gql/graphql'
import { FollowButton } from '@/app/(sanity)/components/follow/follow-button'
import {
  COLLECTIONS_QUERY,
  type ArticleCollectionType,
} from '@/app/(sanity)/groq/collections-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { Section, SectionH3 } from '@/app/components/ui/section'
import { t } from '@/lib/withT'
import { css } from '@republik/theme/css'
import Image from 'next/image'
import { FORMATS_FEATURED, FORMATS_STYLE } from './config'

function FormatCard({ collection }: { collection: ArticleCollectionType }) {
  return (
    <div
      data-theme='light'
      className={css({
        flex: '0 0 280px',
        scrollSnapAlign: 'start',
        height: '315px',
        mx: 2,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        color: 'text',
        md: {
          mx: 'initial',
        },
      })}
      style={FORMATS_STYLE[collection._id]}
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
        {collection.description}
      </h4>
      <p className={css({ fontSize: 'l', letterSpacing: '-0.11' })}>
        Von {FORMATS_STYLE[collection._id]?.author}
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
        <FollowButton
          type={SubscriptionObjectType.Document}
          objectId={`sanity:${collection._id}`}
        />
        <Image
          className={css({ maxHeight: '160px', maxWidth: '120px' })}
          src={FORMATS_STYLE[collection._id]?.imageSrc}
          unoptimized
          height={160}
          width={120}
          alt='' // Decorative images don't need alt text
        />
      </div>
    </div>
  )
}

export async function FormatsSection() {
  const { data } = await sanityFetch({
    query: COLLECTIONS_QUERY,
    params: { ids: FORMATS_FEATURED },
  })

  const formats = data

  if (!formats?.length) return null

  return (
    <Section>
      <SectionH3>{t('onboarding/formats/title')}</SectionH3>
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
        {FORMATS_FEATURED.map((id) => {
          const collection = formats.find((format) => format._id === id)
          if (!collection) return null
          return <FormatCard key={id} collection={collection} />
        })}
      </div>
    </Section>
  )
}
