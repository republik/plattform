import { Overlay, OverlayBody, OverlayToolbar } from '@project-r/styleguide'

import { useTranslation } from '../../../lib/withT'
import DiscussionContextProvider from '../context/DiscussionContextProvider'
import Discussion from '../Discussion'

export const RootCommentOverlay = ({ discussionPath, parent, onClose }) => {
  const { t } = useTranslation()
  return (
    <Overlay onClose={onClose}>
      <OverlayToolbar title={t('RootCommentOverlay/title')} onClose={onClose} />
      <OverlayBody style={{ paddingTop: 58 }}>
        <DiscussionContextProvider
          discussionPath={discussionPath}
          parentId={parent}
          includeParent
        >
          <Discussion inRootCommentOverlay />
        </DiscussionContextProvider>
      </OverlayBody>
    </Overlay>
  )
}
