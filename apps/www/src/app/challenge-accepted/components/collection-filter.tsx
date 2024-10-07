'use client'
import { useRouter } from 'next/navigation'

import { css } from '@republik/theme/css'
import { wrap } from '@republik/theme/patterns'
import * as ToggleGroup from '@radix-ui/react-toggle-group'

const itemStyle = css({
  background: 'transparent',
  p: '3',
  textStyle: 'sans',
  lineHeight: '1',
  borderColor: 'contrast',
  borderStyle: 'solid',
  borderWidth: 1,
  color: 'contrast',
  cursor: 'pointer',
  whiteSpace: 'nowrap',

  _hover: {
    background: 'contrast',
    color: 'text.inverted',
  },

  '&[data-state="on"]': {
    background: 'contrast',
    color: 'text.inverted',
    cursor: 'default',
  },
})

export const CollectionFilter = ({
  filter,
}: {
  filter: string | undefined
}) => {
  const router = useRouter()

  return (
    <ToggleGroup.Root
      type='single'
      value={filter ?? 'all'}
      onValueChange={(value) => {
        router.replace(`?filter=${value}`, { scroll: false })
      }}
      aria-label='Inhalte anzeigen'
      className={wrap({ gap: '2' })}
    >
      <ToggleGroup.Item className={itemStyle} value='all'>
        Highlights
      </ToggleGroup.Item>
      <ToggleGroup.Item className={itemStyle} value='newsletter'>
        Newsletter
      </ToggleGroup.Item>
      <ToggleGroup.Item className={itemStyle} value='event'>
        Veranstaltungen
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  )
}
