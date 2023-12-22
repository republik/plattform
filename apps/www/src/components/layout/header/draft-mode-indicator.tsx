'use client'
import { css } from '@app/styled-system/css'
import { useRouter } from 'next/navigation'

export const DraftModeIndicator = () => {
  const { refresh } = useRouter()
  return (
    <div
      className={css({
        p: '2',
        backgroundColor: '#ffbc50',
        color: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2',
      })}
    >
      Entwurfs-Vorschau{' '}
      <button
        className={css({
          py: '1',
          px: '3',
          borderRadius: 'full',
          backgroundColor: '#000',
          fontSize: 's',
          color: '#ffbc50',
          cursor: 'pointer',
        })}
        onClick={() => {
          fetch('/api/draft/disable').then(() => refresh())
        }}
      >
        Ausschalten
      </button>
    </div>
  )
}
