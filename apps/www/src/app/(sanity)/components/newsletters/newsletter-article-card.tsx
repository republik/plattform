'use client'

import FollowCollectionContainer from '@/app/(sanity)/components/follow/follow-collection-container'
import { NewsletterSubscribeButton } from '@/app/(sanity)/components/newsletters/newsletter-subscribe'
import type { ArticleNewsletter } from '@/app/(sanity)/lib/types'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { useTranslation } from '@/lib/withT'
import { css } from '@republik/theme/css'

function NewsletterArticleCard({
  newsletter,
}: {
  newsletter: ArticleNewsletter
}) {
  const { t } = useTranslation()

  return (
    <FollowCollectionContainer>
      <div
        className={css({
          background: 'background',
          color: 'text',
          textAlign: 'left',
          position: 'relative',
          display: 'flex',
          gap: 4,
          height: '100%',
          width: '100%',
          mb: 6,
          flexDirection: 'column',
        })}
      >
        <img
          className={css({
            flex: '0 0 1',
            alignSelf: 'flex-start',
            pt: 1,
            width: 64,
          })}
          src={urlFor(newsletter.image).width(192).height(192).url()}
          alt=''
        />
        <div>
          <h3
            className={css({
              textStyle: 'subtitleBold',
              lineHeight: 1.2,
            })}
          >
            {newsletter.title}{' '}
            <span
              className={css({
                fontWeight: 500,
              })}
            >
              {t('newsletters/postbox')}
            </span>
          </h3>
          <p className={css({ textStyle: 'airy', my: 1 })}>
            {newsletter.description}
          </p>
          <p className={css({ color: 'textSoft' })}>{newsletter.frequency}</p>
        </div>
        <div>
          <NewsletterSubscribeButton newsletter={newsletter} />
        </div>
      </div>
    </FollowCollectionContainer>
  )
}

export default NewsletterArticleCard
