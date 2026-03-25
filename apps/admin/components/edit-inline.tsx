import { css } from '@republik/theme/css'
import { Button } from '@republik/ui'
import { useState } from 'react'

export function EditInline({
  title,
  children,
  renderEditing,
}: {
  title?: React.ReactNode
  children: React.ReactNode
  renderEditing: ({ onComplete }: { onComplete: () => void }) => React.ReactNode
}) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4',
        p: '4',
        border: '1px solid ',
        borderColor: 'divider',
      })}
    >
      {title && <h3 className={css({ fontWeight: 'medium' })}>{title}</h3>}
      <div>
        {isEditing
          ? renderEditing({ onComplete: () => setIsEditing(false) })
          : children}
      </div>
      <Button
        variant='link'
        size='small'
        onClick={() => setIsEditing(!isEditing)}
      >
        {isEditing ? 'Abbrechen' : 'Bearbeiten'}
      </Button>
    </div>
  )
}
