'use client'

import { NewsletterName } from '#graphql/republik-api/__generated__/gql/graphql'
import FollowFormatContainer from '@app/components/follow/follow-format-container'
import { NL_STYLE } from '@app/components/newsletters/config'
import { NewsletterSubscribeButton } from '@app/components/newsletters/newsletter-subscribe'
import { css } from '@republik/theme/css'
import Image from 'next/image'
import { useTranslation } from '../../../lib/withT'

function NewsletterArticleCard({
  newsletter,
  button,
}: {
  newsletter: NewsletterName
  button?: boolean
}) {
  const { t } = useTranslation()

  if (button) return <NewsletterSubscribeButton newsletter={newsletter} />

  return (
    <FollowFormatContainer>
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
        <Image
          className={css({
            flex: '0 0 1',
            alignSelf: 'flex-start',
            pt: 1,
            _dark: { display: 'none' },
          })}
          width='64'
          src={NL_STYLE[newsletter]?.imageSrc}
          alt=''
        />
        <Image
          className={css({
            display: 'none',
            flex: '0 0 1',
            alignSelf: 'flex-start',
            _dark: { display: 'block' },
          })}
          width='64'
          src={NL_STYLE[newsletter]?.imageSrcDark}
          alt=''
        />
        <div>
          <h3
            className={css({
              textStyle: 'subtitleBold',
              lineHeight: 1.2,
            })}
          >
            {t(`newsletters/${newsletter}/name`)}{' '}
            <span
              className={css({
                fontWeight: 500,
              })}
            >
              in den Postfach bekommen
            </span>
          </h3>
          <p className={css({ textStyle: 'airy', my: 1 })}>
            {t(`newsletters/${newsletter}/description`)}
          </p>
          <p className={css({ color: 'textSoft' })}>
            {t(`newsletters/${newsletter}/schedule`)}
          </p>
        </div>
        <div>
          <NewsletterSubscribeButton newsletter={newsletter} />
        </div>
      </div>
    </FollowFormatContainer>
  )
}

export default NewsletterArticleCard
