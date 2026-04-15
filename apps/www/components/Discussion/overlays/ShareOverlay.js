import compose from 'lodash/flowRight'
import withT from '../../../lib/withT'

import ShareOverlay from '../../ActionBar/ShareOverlay'

const DiscussionShareOverlay = ({ t, onClose, url, title }) => (
  <ShareOverlay
    onClose={onClose}
    url={url}
    title={t('discussion/share/title')}
    emailSubject={t('discussion/share/emailSubject', {
      title,
    })}
    emailBody={''}
    emailAttachUrl={url}
  />
)

export default compose(withT)(DiscussionShareOverlay)
