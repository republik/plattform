'use client'

import {
  NewsletterName,
  UpdateNewsletterSubscriptionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import { NL_STYLE } from '@app/components/newsletters/config'
import NewsletterSubscribe from '@app/components/newsletters/newsletter-subscribe'
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
        cursor: 'pointer',
        textAlign: 'left',
        position: 'relative',
        display: 'flex',
        gap: 2,
        height: '100%',
        md: {
          flexDirection: 'column',
        },
        _disabled: {
          cursor: 'default',
        },
      })}
      onClick={toggleSubscription}
      aria-disabled={disabled}
      data-disabled={disabled}
      role='button'
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
          pt: 1,
          _dark: { display: 'block' },
        })}
        width='64'
        src={NL_STYLE[newsletter]?.imageSrcDark}
        alt=''
      />
      <div
        className={css({
          textAlign: 'left',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          pr: '22px',
          md: { pr: 0 },
        })}
      >
        <h3
          className={css({
            textStyle: 'subtitleBold',
            lineHeight: 1.2,
            mb: 2,
          })}
        >
          {t(`newsletters/${newsletter}/name`)}
        </h3>
        <p className={css({ textStyle: 'airy' })}>
          {t(`newsletters/${newsletter}/description`)}
        </p>
        <p className={css({ color: 'textSoft' })}>
          {t(`newsletters/${newsletter}/schedule`)}
        </p>
      </div>
      {subscribed !== undefined && (
        <NewsletterSubscribe
          toggleSubscription={toggleSubscription}
          isPending={isPending}
          subscribed={subscribed}
          disabled={disabled}
        />
      )}
    </div>
  )
}

export default NewsletterArticleCard
