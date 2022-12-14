import React from 'react'
import Link from 'next/link'

import {
  Overlay,
  OverlayToolbar,
  OverlayBody,
  fontFamilies,
  plainLinkRule,
} from '@project-r/styleguide'

import TrialForm from '../Trial/Form'

import { TrackingProps } from './Paynote'

const PseudoTabs = () => (
  <div>
    <span style={{ marginRight: 10 }}>Anmelden</span>
    <Link href='/anmelden' passHref>
      <a
        {...plainLinkRule}
        style={{ fontFamily: fontFamilies.sansSerifRegular }}
      >
        Einloggen
      </a>
    </Link>
  </div>
)

export const TrialOverlay: React.FC<{
  documentId: string
  repoId: string
  onClose: () => void
}> = ({ documentId, repoId, onClose }) => {
  const trackingPayload: TrackingProps = {
    documentId,
    repoId,
    variation: 'trial/link-blocker',
  }
  return (
    <Overlay mini onClose={onClose}>
      <OverlayToolbar onClose={onClose} title={<PseudoTabs />} />
      <OverlayBody>
        <TrialForm
          payload={trackingPayload}
          onSuccess={() => false}
          minimal
          showTitleBlock
        />
      </OverlayBody>
    </Overlay>
  )
}

const getLinkBlocker: (preventAccess: () => void) => React.FC<{
  href: string
}> =
  (preventAccess) =>
  ({ href, children }) => {
    if (href) return <>{children}</>

    return (
      <span
        onClick={(e) => {
          e.preventDefault()
          preventAccess()
        }}
      >
        {children}
      </span>
    )
  }

export default getLinkBlocker
