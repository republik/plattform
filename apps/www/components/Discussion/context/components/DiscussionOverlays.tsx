import ShareOverlay from '../../overlays/ShareOverlay'
import { useDiscussion } from '../DiscussionContext'
import { DiscussionPreferences } from '../../overlays/DiscussionPreferences'
import useDiscussionPreferences from '../../hooks/useDiscussionPreferences'
import { useTranslation } from '../../../../lib/withT'
import { FeatureCommentOverlay } from '../../overlays/FeatureCommentOverlay'


const DiscussionOverlays = () => {
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
          discussionId={discussion.id}
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
    </>
  )
}

export default DiscussionOverlays
