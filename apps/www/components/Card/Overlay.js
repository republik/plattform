import { Overlay, OverlayBody, OverlayToolbar } from '@project-r/styleguide'

import Beta from './Beta'

const CardOverlay = ({
  onClose,
  title,
  children,
  beta = false,
  maxWidth = 720,
}) => {
  return (
    <Overlay onClose={onClose} mUpStyle={{ maxWidth, minHeight: 0 }}>
      <OverlayToolbar title={title} onClose={onClose}>
        {beta && (
          <Beta
            style={{
              position: 'absolute',
              right: 60,
              top: 9,
            }}
          />
        )}
      </OverlayToolbar>
      <OverlayBody style={{ textAlign: 'left' }}>{children}</OverlayBody>
    </Overlay>
  )
}

export default CardOverlay
