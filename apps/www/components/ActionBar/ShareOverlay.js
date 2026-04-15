import { Overlay, OverlayBody, OverlayToolbar } from '@project-r/styleguide'

import withT from '../../lib/withT'
import ShareButtons from './ShareButtons'

const ShareOverlay = ({
  title,
  url,
  emailSubject,
  emailBody,
  emailAttachUrl,
  onClose,
  eventCategory = 'ShareOverlay',
}) => (
  <Overlay onClose={onClose} mUpStyle={{ maxWidth: 400, minHeight: 0 }}>
    <OverlayToolbar title={title} onClose={onClose} />
    <OverlayBody>
      <div style={{ textAlign: 'center' }}>
        <ShareButtons
          onClose={onClose}
          url={url}
          grid
          emailSubject={emailSubject}
          emailBody={emailBody}
          emailAttachUrl={emailAttachUrl}
          eventCategory={eventCategory}
        />
      </div>
    </OverlayBody>
  </Overlay>
)

export default withT(ShareOverlay)
