'use client'

import {
  EventObjectType,
  SubscribeDocument,
  SubscriptionObjectType,
  UnsubscribeDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { ApolloError, useMutation } from '@apollo/client'
import { ErrorMessage } from '@app/components/auth/login/error-message'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import * as Select from '@radix-ui/react-select'

import { css, cx } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import { Check, ChevronDown } from 'lucide-react'
import React from 'react'
import { useTranslation } from '../../../lib/withT'

type AuthorNotificationOption = 'DOCUMENTS' | 'ALL' | 'NONE'

const OPTIONS: { value: AuthorNotificationOption; warning?: boolean }[] = [
  { value: 'DOCUMENTS' },
  { value: 'ALL' },
  { value: 'NONE', warning: true },
]

function FollowAuthorDropdown({
  subscriptionId,
  subscriptionFilters,
  objectId,
  objectName,
}: {
  subscriptionId?: string
  subscriptionFilters?: EventObjectType[]
  objectId: string
  objectName: string
}) {
  const [subscribe] = useMutation(SubscribeDocument)
  const [unsubscribe] = useMutation(UnsubscribeDocument)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<ApolloError>()
  const { t } = useTranslation()
  const track = useTrackEvent()
  const trackingInfo = `Author: ${objectName}`

  async function handleChange(value: AuthorNotificationOption) {
    if (loading) return
    setLoading(true)

    let result: any

    if (value === 'DOCUMENTS') {
      result = await subscribe({
        variables: {
          objectId,
          type: SubscriptionObjectType.User,
          filters: [EventObjectType.Document],
        },
      })
    } else if (value === 'ALL') {
      result = await subscribe({
        variables: {
          objectId,
          type: SubscriptionObjectType.User,
          filters: [EventObjectType.Document, EventObjectType.Comment],
        },
      })
    } else {
      result = await unsubscribe({
        variables: {
          subscriptionId,
        },
      })
    }

    if (result.errors && result.errors.length > 0) {
      setError(new ApolloError({ graphQLErrors: result.errors }))
      return setLoading(false)
    }

    track({
      action: value === 'NONE' ? 'Unfollow' : 'Follow',
      name: trackingInfo,
    })
    setLoading(false)
  }

  const selectedOption = !subscriptionId
    ? 'NONE'
    : subscriptionFilters?.length === 1 &&
      subscriptionFilters.includes(EventObjectType.Document)
    ? 'DOCUMENTS'
    : 'ALL'

  return (
    <div className={css({ position: 'relative' })}>
      <Select.Root
        value={selectedOption}
        disabled={loading}
        onValueChange={handleChange}
        onOpenChange={(open) => {
          if (open && selectedOption === 'NONE') {
            handleChange('DOCUMENTS')
          }
        }}
      >
        <Select.Trigger
          aria-label='follow discussion'
          className={cx(
            button({
              variant: selectedOption === 'NONE' ? 'default' : 'outline',
              size: 'small',
            }),
            loading && css({ cursor: 'loading' }),
            css({
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              _focusVisible: { outline: 'none' },
            }),
          )}
        >
          <Select.Value>
            {t(`follow/author/${selectedOption}/action`)}
          </Select.Value>
          <Select.Icon>
            <ChevronDown className={css({ marginTop: '3px' })} size={16} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position='popper'
            side='bottom'
            sideOffset={8}
            className={css({
              overflow: 'hidden',
              backgroundColor: 'background',
              boxShadow: 'sm',
            })}
          >
            <Select.Viewport>
              {OPTIONS.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className={css({
                    borderTopWidth: '1px',
                    borderTopColor: 'divider',
                    borderTopStyle: 'solid',
                    display: 'flex',
                    alignItems: 'center',
                    color: option.warning ? 'error' : 'text',
                    cursor: 'pointer',
                    gap: 3,
                    py: 2,
                    pr: 6,
                    pl: 3,
                    userSelect: 'none',
                    _first: { borderTop: 'none' },
                    _highlighted: { outline: 'none', background: 'hover' },
                  })}
                >
                  <Check
                    size={18}
                    className={css({ color: 'text' })}
                    style={{
                      opacity: option.value === selectedOption ? 1 : 0,
                    }}
                  />
                  <Select.ItemText>
                    {t(`follow/author/${option.value}/label`)}
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      {error && (
        <div className={css({ position: 'absolute', bottom: -43, left: 0 })}>
          <ErrorMessage error={error} />
        </div>
      )}
    </div>
  )
}

export default FollowAuthorDropdown
