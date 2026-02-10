'use client'

import {
  NewsletterName,
  UpdateNewsletterSubscriptionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import { NL_STYLE } from '@app/components/newsletters/config'
import { NewsletterSubscribeButton } from '@app/components/newsletters/newsletter-subscribe'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from '../../../lib/withT'

function NewsletterArticleCard({
  newsletter,
  subscribed,
  disabled,
}: {
  newsletter: NewsletterName
  subscribed?: boolean
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const [updateNewsletterSubscription] = useMutation(
    UpdateNewsletterSubscriptionDocument,
  )
  const [isPending, setIsPending] = useState(false)
  const track = useTrackEvent()

  async function toggleSubscription(e) {
    e.stopPropagation()

    if (disabled || isPending) return

    setIsPending(true)
    const { data } = await updateNewsletterSubscription({
      variables: {
        name: newsletter,
        subscribed: !subscribed,
      },
    })

    if (data) {
      track({
        action: data.updateNewsletterSubscription.subscribed
          ? 'Newsletter Subscribe'
          : 'Newsletter Unsubscribe',
        name: data.updateNewsletterSubscription.name,
      })
    }
    setIsPending(false)
  }

  return (
    <div
      className={css({
        background: 'background',
        color: 'text',
        textAlign: 'left',
        position: 'relative',
        display: 'flex',
        gap: 4,
        height: '100%',
        mb: 6,
        md: {
          flexDirection: 'column',
        },
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
      {subscribed !== undefined && (
        <div>
          <NewsletterSubscribeButton
            toggleSubscription={toggleSubscription}
            isPending={isPending}
            subscribed={subscribed}
            disabled={disabled}
            longCopy
          />
        </div>
      )}
    </div>
  )
}

export default NewsletterArticleCard
