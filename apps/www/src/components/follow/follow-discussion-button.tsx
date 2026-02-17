'use client'

import * as Select from '@radix-ui/react-select'

import { IconCheckSmall } from '@republik/icons'
import { css, cx } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import { ChevronDown } from 'lucide-react'
import React from 'react'
import { useTranslation } from '../../../lib/withT'

function FollowDiscussionButton({ discussionId }: { discussionId: string }) {
  const [followState, setFollowState] = React.useState('none')
  const [loading, setLoading] = React.useState(false)
  const { t } = useTranslation()
  const OPTIONS = [{ value: 'all' }, { value: 'answers' }, { value: 'none' }]

  console.log('followState', followState)

  return (
    <>
      <Select.Root
        value={followState}
        onValueChange={setFollowState}
        onOpenChange={(open) => {
          if (open && followState === 'none') {
            setFollowState('all')
          }
        }}
      >
        <Select.Trigger
          aria-label='follow discussion status'
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
            className={css({
              overflow: 'hidden',
              backgroundColor: 'white',
              boxShadow: 'shadows.sm',
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
                    py: 2,
                    px: 4,
                    userSelect: 'none',
                    _first: { borderTop: 'none' },
                    _highlighted: { outline: 'none' },
                  })}
                >
                  <Select.ItemIndicator>
                    <IconCheckSmall />
                  </Select.ItemIndicator>
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
