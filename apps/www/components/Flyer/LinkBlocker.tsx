import React from 'react'

import {
  Overlay,
  OverlayToolbar,
  OverlayBody,
  fontFamilies,
  plainButtonRule,
} from '@project-r/styleguide'

import TrialForm from '../Trial/Form'
import SignIn from '../Auth/SignIn'

import { TrackingProps } from './Paynote'

const Tab = ({ isActive, onClick, label }) =>
  isActive ? (
    <span style={{ marginRight: 10 }}>{label}</span>
  ) : (
    <button
      {...plainButtonRule}
      style={{ fontFamily: fontFamilies.sansSerifRegular, marginRight: 10 }}
      onClick={onClick}
    >
      {label}
    </button>
  )

export const TrialOverlay: React.FC<{
  documentId: string
  repoId: string
  onClose: () => void
}> = ({ documentId, repoId, onClose }) => {
  const [tab, setTab] = React.useState<'login' | 'register'>('register')
  const trackingPayload: TrackingProps = {
    documentId,
    repoId,
    variation: 'trial/link-blocker',
  }

  const tabs = (
    <div>
      <Tab
        onClick={() => setTab('register')}
        label='Registrieren'
        isActive={tab === 'register'}
      />
      <Tab
        onClick={() => setTab('login')}
        label='Anmelden'
        isActive={tab === 'login'}
      />
    </div>
  )

  return (
    <Overlay mini onClose={onClose}>
      <OverlayToolbar onClose={onClose} title={tabs} />
      <OverlayBody>
        {tab === 'register' && (
          <TrialForm
            payload={trackingPayload}
            onSuccess={() => false}
            minimal
            titleBlockKey='journal'
          />
        )}
        {tab === 'login' && <SignIn />}
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
