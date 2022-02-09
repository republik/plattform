import React from 'react'
import {
  Overlay,
  OverlayToolbar,
  OverlayToolbarClose,
  Interaction,
  OverlayBody,
} from '@project-r/styleguide'
import withT from '../../lib/withT'
import AuthNotification from '../Auth/Notification'

const AppSignInOverlay = ({ onClose, query, setQuery, t }) => (
  <Overlay onClose={onClose}>
    <OverlayToolbar title={t('AppSignInOverlay/title')} onClose={onClose} />
    <OverlayBody>
      <AuthNotification
        query={query}
        onClose={onClose}
        goTo={(type, email, context) => {
          if (type === 'email-confirmed') {
            onClose()
            return
          }
          setQuery({ type, email, context })
        }}
      />
    </OverlayBody>
  </Overlay>
)

export default withT(AppSignInOverlay)
