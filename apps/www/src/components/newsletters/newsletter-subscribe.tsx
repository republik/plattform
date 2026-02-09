'use client'

import { Button } from '@app/components/ui/button'
import { Spinner } from '@app/components/ui/spinner'
import { css } from '@republik/theme/css'
import { Check, Plus } from 'lucide-react'

function MobileButton({
  toggleSubscription,
  isPending,
  subscribed,
  disabled,
}: {
  toggleSubscription: (e: any) => Promise<void>
  isPending: boolean
  subscribed: boolean
  disabled?: boolean
}) {
  return (
    <button
      className={css({
        position: 'absolute',
        cursor: 'pointer',
        top: 4,
        right: 4,
        md: { display: 'none' },
        '&:disabled:not([data-loading], [aria-busy="true"])': {
          opacity: 0.5,
        },
      })}
      onClick={toggleSubscription}
      disabled={disabled || isPending}
      aria-busy={isPending}
    >
      {isPending ? (
        <Spinner size='large' />
      ) : subscribed ? (
        <Check
          strokeWidth={2.5}
          size={20}
          className={css({
            color: 'text.inverted',
            background: 'contrast',
            borderRadius: '100%',
            borderColor: 'contrast',
            borderWidth: '2px',
            borderStyle: 'solid',
            boxSizing: 'content-box',
          })}
        />
      ) : (
        <Plus
          className={css({
            borderRadius: '100%',
            borderWidth: '2px',
            borderStyle: 'solid',
          })}
        />
      )}
    </button>
  )
}

function DesktopButton({
  toggleSubscription,
  isPending,
  subscribed,
  disabled,
}: {
  toggleSubscription: (e: any) => Promise<void>
  isPending: boolean
  subscribed: boolean
  disabled?: boolean
}) {
  return (
    <Button
      className={css({
        fontWeight: 500,
        textDecoration: 'none',
        display: 'none',
        md: { display: 'block' },
      })}
      onClick={toggleSubscription}
      disabled={disabled || isPending}
      type='button'
      size='small'
      variant={subscribed ? 'outline' : 'default'}
      loading={isPending}
    >
      {subscribed ? 'Abonniert' : 'Abonnieren'}
    </Button>
  )
}

function NewsletterSubscribe({
  toggleSubscription,
  isPending,
  subscribed,
  disabled,
}) {
  return (
    <div>
      <DesktopButton
        toggleSubscription={toggleSubscription}
        isPending={isPending}
        subscribed={subscribed}
        disabled={disabled}
      />
      <MobileButton
        toggleSubscription={toggleSubscription}
        isPending={isPending}
        subscribed={subscribed}
        disabled={disabled}
      />
    </div>
  )
}

export default NewsletterSubscribe
