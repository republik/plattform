import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import ShareOverlay from '../../overlays/ShareOverlay'
import { useDiscussion } from '../DiscussionContext'
import { DiscussionPreferences } from '../../overlays/DiscussionPreferences'
import useDiscussionPreferences from '../../hooks/useDiscussionPreferences'
import { useTranslation } from '../../../../lib/withT'
import { FeatureCommentOverlay } from '../../overlays/FeatureCommentOverlay'
import { RootCommentOverlay } from '../../overlays/RootCommentOverlay'
import { getFocusHref } from '../../shared/CommentLink'

const propTypes = {
  isBoardRoot: PropTypes.bool,
}

const DiscussionOverlays = ({
  isBoardRoot,
}: PropTypes.InferProps<typeof propTypes>) => {
  const router = useRouter()
  const { t } = useTranslation()
  const {
    id,
    discussion,
    overlays: { shareOverlay, preferencesOverlay, featureOverlay },
  } = useDiscussion()
  const { preferences, loading, error, updateDiscussionPreferencesHandler } =
    useDiscussionPreferences(id)

  return (
    <>
      {preferencesOverlay.open && (
        <DiscussionPreferences
          t={t}
          discussionPreferences={{
            ...preferences,
            loading,
            error,
          }}
          setDiscussionPreferences={updateDiscussionPreferencesHandler}
          onClose={preferencesOverlay.handleClose}
          autoCredential={preferencesOverlay.data}
        />
      )}

      {featureOverlay.open && (
        <FeatureCommentOverlay comment={featureOverlay.data} />
      )}

      {shareOverlay.open && (
        <ShareOverlay
          discussionId={discussion.id}
          onClose={shareOverlay.handleClose}
          url={shareOverlay.data}
          title={discussion.title}
        />
      )}

      {isBoardRoot && !!router.query.parent && (
        <RootCommentOverlay
          discussionPath={discussion.path}
          parent={router.query.parent}
          onClose={() => {
            const href = getFocusHref(discussion)
            return href && router.push(href)
          }}
        />
      )}
    </>
  )
}

DiscussionOverlays.propTypes = propTypes

export default DiscussionOverlays
