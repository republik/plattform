'use client'

import * as Select from '@radix-ui/react-select'

import { css, cx } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import { Check, ChevronDown } from 'lucide-react'
import React from 'react'
import { useTranslation } from '../../../lib/withT'

function FollowDiscussionButton({ discussionId }: { discussionId: string }) {
  const [followState, setFollowState] = React.useState('none')
  const [loading, setLoading] = React.useState(false)
  const { t } = useTranslation()
  const OPTIONS = [
    { value: 'all' },
    { value: 'answers' },
    { value: 'none', warning: true },
  ]

  function handleChange(value: string) {
    if (loading) return

    setLoading(true)
    // api call goes here
    setFollowState(value)
    setLoading(false)
  }

  return (
    <>
      <Select.Root
        value={followState}
        disabled={loading}
        onValueChange={handleChange}
        onOpenChange={(open) => {
          if (open && followState === 'none') {
            setFollowState('all')
          }
        }}
      >
        <Select.Trigger
          aria-label='follow discussion'
          className={cx(
            button({
              variant: followState === 'none' ? 'default' : 'outline',
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
    </>
  )
}

export default FollowDiscussionButton
