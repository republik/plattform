import React from 'react'
import {
  Overlay,
  OverlayToolbar,
  OverlayToolbarClose,
  OverlayBody
} from '@project-r/styleguide'
import ErrorMessage from '../ErrorMessage'

export default ({ error, onClose }) =>
  !!error && (
    <Overlay onClose={onClose}>
      <OverlayToolbar>
        <OverlayToolbarClose onClick={onClose} />
      </OverlayToolbar>

      <OverlayBody>
        <ErrorMessage error={error} />
      </OverlayBody>
    </Overlay>
  )
