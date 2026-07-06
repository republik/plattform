import { SubscriptionObjectType } from '#graphql/republik-api/__generated__/gql/graphql'
import { FollowButton } from '@/app/(sanity)/components/follow/follow-button'
import FollowPodcast from '@/app/(sanity)/components/follow/follow-podcast'
import { NewsletterSubscribeButton } from '@/app/(sanity)/components/newsletters/newsletter-subscribe'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { css } from '@republik/theme/css'
import { defineQuery } from 'next-sanity'

const PAGE_BUILDER_CTA_BLOCK_QUERY = defineQuery(`
  *[_type == "page" && _id == $documentId][0]{
    "block": pageBuilder[_key == $blockKey][0]{
      target->{
        _id,
        _type,
        _type == "newsletter" => {
          name,
          title
        },
        _type == "podcast" => {
          podigeeSlug,
          spotifyUrl,
          appleUrl
        },
        _type == "articleCollection" => {
          title,
          description
        }
      }
    }
  }
`)

export async function CallToAction({
  blockKey,
  documentId,
}: {
  blockKey: string
  documentId: string
}) {
  const { data } = await sanityFetch({
    query: PAGE_BUILDER_CTA_BLOCK_QUERY,
    params: { documentId, blockKey },
  })

  if (!data || !data.block) return null

  const {
    block: { target },
  } = data

  return (
    <div className={css({ mx: 'auto' })}>
      {target._type === 'newsletter' ? (
        <NewsletterSubscribeButton newsletter={target} />
      ) : target._type === 'articleCollection' ? (
        <FollowButton type={SubscriptionObjectType.Document} />
      ) : target._type === 'podcast' ? (
        <FollowPodcast podcast={target} />
      ) : null}
    </div>
  )
}
