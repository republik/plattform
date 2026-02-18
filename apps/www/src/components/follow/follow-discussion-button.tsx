'use client'

import {
  DiscussionNotificationOption,
  SetDiscussionPreferencesDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { ApolloError, useMutation } from '@apollo/client'
import { ErrorMessage } from '@app/components/auth/login/error-message'
import * as Select from '@radix-ui/react-select'

import { css, cx } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import { Check, ChevronDown } from 'lucide-react'
import React from 'react'
import { useDiscussion } from '../../../components/Discussion/context/DiscussionContext'
import { useTranslation } from '../../../lib/withT'

function FollowDiscussionButton() {
  const discussionContext = useDiscussion()
  const [followState, setFollowState] = React.useState<
    DiscussionNotificationOption | undefined
  >(
    discussionContext?.discussion?.userPreference
      ?.notifications as DiscussionNotificationOption,
  )
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<ApolloError>()
  const { t } = useTranslation()
  const [updateState] = useMutation(SetDiscussionPreferencesDocument)

  if (!discussionContext?.discussion) {
    return null
  }

  const OPTIONS = [
    { value: DiscussionNotificationOption.All },
    { value: DiscussionNotificationOption.MyChildren }, // only replies to own comments
    { value: DiscussionNotificationOption.None, warning: true },
  ]

  async function handleChange(value: DiscussionNotificationOption) {
    if (loading) return

    const previousState = followState // optimistically update UI

    setFollowState(value)
    setLoading(true)

    const result = await updateState({
      variables: {
        discussionId: discussionContext.discussion.id,
        discussionPreferences: { notifications: value },
      },
    })

    if (result.errors && result.errors.length > 0) {
      setError(new ApolloError({ graphQLErrors: result.errors }))
      setFollowState(previousState) // revert to previous state on error
      return setLoading(false)
    }

    setFollowState(value)
    setLoading(false)
  }

  return (
    <div className={css({ position: 'relative' })}>
      <Select.Root
        value={followState}
        disabled={loading}
        onValueChange={handleChange}
        onOpenChange={(open) => {
          if (open && followState === DiscussionNotificationOption.None) {
            handleChange(DiscussionNotificationOption.All)
          }
        }}
      >
        <Select.Trigger
          aria-label='follow discussion'
          className={cx(
            button({
              variant:
                followState === DiscussionNotificationOption.None
                  ? 'default'
                  : 'outline',
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
            {t(`follow/discussion/${followState}/action`)}
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
                      opacity: option.value === followState ? 1 : 0,
                    }}
                  />
                  <Select.ItemText>
                    {t(`follow/discussion/${option.value}/label`)}
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

export default FollowDiscussionButton
