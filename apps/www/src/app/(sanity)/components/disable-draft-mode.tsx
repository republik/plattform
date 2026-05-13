'use client'
import { css } from '@republik/theme/css'
import { useIsPresentationTool } from 'next-sanity/hooks'

export function DisableDraftMode() {
  const isPresentationTool = useIsPresentationTool()
  // Hide the button when inside the Presentation Tool
  if (isPresentationTool) return null

  return (
    <a
      href='/api/draft-mode/disable'
      className={css({
        position: 'fixed',
        bottom: '4',
        right: '4',
        px: '4',
        py: '2',
        backgroundColor: 'orange',
        borderRadius: 'full',
        color: 'white',
      })}
    >
      Vorschau-Modus deaktivieren
    </a>
  )
}
