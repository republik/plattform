import { Overlay, OverlayBody, OverlayToolbar } from '@project-r/styleguide'

import withT from '../../lib/withT'

import PodcastButtons from '../Article/PodcastButtons'

const PodcastOverlay = ({ t, title, podcast, onClose }) => {
  return (
    <Overlay onClose={onClose} mUpStyle={{ maxWidth: 400, minHeight: 0 }}>
      <OverlayToolbar title={title} onClose={onClose} />
      <OverlayBody>
        <div style={{ textAlign: 'center' }}>
          <PodcastButtons {...podcast} />
        </div>
      </OverlayBody>
    </Overlay>
  )
}

export default withT(PodcastOverlay)
