'use client'
import { useRouter } from 'next/navigation'

import { css } from '@app/styled-system/css'
import { hstack } from '@app/styled-system/patterns'
import * as ToggleGroup from '@radix-ui/react-toggle-group'

const itemStyle = css({
  background: 'transparent',
  p: '3',
  textStyle: 'sans',
  lineHeight: '1',

  _hover: {
    background: 'overlay',
  },

  '&[data-state="on"]': {
    background: 'contrast',
    color: 'text.inverted',
    _hover: {
      background: 'contrast',
    },
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
      className={hstack({ gap: '2' })}
    >
      <ToggleGroup.Item className={itemStyle} value='all'>
        Alle Inhalte
      </ToggleGroup.Item>
      <ToggleGroup.Item className={itemStyle} value='article'>
        Artikel
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
