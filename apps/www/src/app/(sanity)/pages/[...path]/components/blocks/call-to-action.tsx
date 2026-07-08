import { SubscriptionObjectType } from '#graphql/republik-api/__generated__/gql/graphql'
import { FollowButton } from '@/app/(sanity)/components/follow/follow-button'
import FollowPodcast from '@/app/(sanity)/components/follow/follow-podcast'
import { NewsletterSubscribeButton } from '@/app/(sanity)/components/newsletters/newsletter-subscribe'
import { CtaBlockFragmentType } from '@/app/(sanity)/groq/cta-block-fragment'
import { css } from '@republik/theme/css'

export async function CallToAction({ cta }: { cta: CtaBlockFragmentType }) {
  const { target } = cta

  if (!target) return null

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
