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
import { PODCASTS_FEATURED, PODCASTS_STYLE } from './config'

function PodcastCard({ collection }: { collection: ArticleCollectionType }) {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <div
        style={PODCASTS_STYLE[collection._id]}
        className={css({
          display: 'flex',
          flexDirection: 'column',
          aspectRatio: '1/1',
          padding: 2,
          mb: 2,
          justifyContent: 'space-between',
          fontSize: '3xl',
          fontFamily: 'republikSerif',
          lineHeight: '0.9',
          lg: {
            fontSize: '4xl',
          },
        })}
      >
        <h4
          className={css({
            textAlign: 'right',
          })}
        >
          {collection.title}
        </h4>
        <span
          className={css({
            lineHeight: 0.5,
            color: 'white',
          })}
        >
          R
        </span>
      </div>
      <p
        className={css({
          textStyle: 'body',
          mt: 1,
        })}
      >
        {collection.description}
      </p>
      <div className={css({ mt: 2 })}>
        <FollowButton
          type={SubscriptionObjectType.Document}
          objectId={`sanity:${collection._id}`}
        />
      </div>
    </div>
  )
}

export async function PodcastsSection() {
  const { data } = await sanityFetch({
    query: COLLECTIONS_QUERY,
    params: { ids: PODCASTS_FEATURED },
  })

  const podcasts = data

  if (!podcasts?.length) return null

  return (
    <Section>
      <SectionH3>{t('onboarding/podcasts/title')}</SectionH3>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          pb: 4,
          md: {
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 4,
          },
        })}
      >
        {PODCASTS_FEATURED.map((id) => {
          const collection = podcasts.find((p) => p._id === id)
          if (!collection) return null
          return <PodcastCard key={id} collection={collection} />
        })}
      </div>
    </Section>
  )
}
