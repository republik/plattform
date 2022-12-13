import React, { useState } from 'react'

import { Overlay, OverlayToolbar, OverlayBody } from '@project-r/styleguide'

const PaynoteLink: React.FC<{ href: string }> = ({ href, children }) => {
  const [overlay, showOverlay] = useState<boolean>()

  if (href) return <>{children}</>

  return (
    <>
      <span
        onClick={(e) => {
          e.preventDefault()
          showOverlay(true)
        }}
      >
        {children}
      </span>
      {overlay && (
        <Overlay onClose={() => showOverlay(false)}>
          <OverlayToolbar title='Nope!' onClose={() => showOverlay(false)} />
          <OverlayBody>
            <div style={{ textAlign: 'center' }}>BACK OFF!</div>
          </OverlayBody>
        </Overlay>
      )}
    </>
  )
}

export default PaynoteLink
