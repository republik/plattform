'use client'

import { Button } from '@app/components/ui/button'
import { css } from '@republik/theme/css'

export function NewsletterSubscribeButton({
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
      })}
      onClick={toggleSubscription}
      disabled={disabled || isPending}
      type='button'
      variant={subscribed ? 'outline' : 'default'}
      loading={isPending}
    >
      Newsletter {subscribed ? 'abonniert' : 'abonnieren'}
    </Button>
  )
}
