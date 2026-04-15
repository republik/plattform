import { css } from 'glamor'
import { useRouter } from 'next/router'

const styles = {
  container: css({
    padding: '8px',
    backgroundColor: '#ffbc50',
    color: '#000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
  }),
  button: css({
    padding: '4px 12px',
    borderRadius: '99rem',
    borderWidth: 0,
    backgroundColor: '#000',
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: '#ffbc50',
    cursor: 'pointer',
  }),
}

export const DraftModeIndicator = () => {
  const { reload } = useRouter()
  return (
    <div {...styles.container}>
      Entwurfs-Vorschau{' '}
      <button
        {...styles.button}
        onClick={() => {
          fetch('/api/draft/disable').then(() => reload())
        }}
      >
        Ausschalten
      </button>
    </div>
  )
}
