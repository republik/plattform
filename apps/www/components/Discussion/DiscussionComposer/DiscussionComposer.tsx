import { useEffect, useMemo, useState } from 'react'
import {
  CommentComposer,
  CommentComposerPlaceholder,
  readDiscussionCommentDraft,
} from '@project-r/styleguide'
import PropTypes from 'prop-types'
import { useDiscussion } from '../context/DiscussionContext'
import { useTranslation } from '../../../lib/withT'
import { composerHints } from '../shared/constants'
import useSubmitCommentHandler from '../hooks/actions/useSubmitCommentHandler'
import useEditCommentHandler from '../hooks/actions/useEditCommentHandler'
import useDiscussionPreferences from '../hooks/useDiscussionPreferences'
import SecondaryActions from '../shared/SecondaryActions'
import DiscussionComposerBarrier from './DiscussionComposerBarrier'
import usePreviewCommentHandler from '../helpers/usePreviewCommentHandler'

const propTypes = {
  showPayNotes: PropTypes.bool,
  isRoot: PropTypes.bool,
  onClose: PropTypes.func,
  commentId: PropTypes.string,
  parentId: PropTypes.string,
  initialText: PropTypes.string,
  initialTagValue: PropTypes.string,
  initialActiveState: PropTypes.bool,
  placeholder: PropTypes.string,
}

const DiscussionComposer = ({
  showPayNotes,
  isRoot = false,
  onClose,
  // Props below are used for editing a comment
  commentId,
  parentId,
  initialText,
  initialTagValue,
  initialActiveState,
  placeholder,
}: PropTypes.InferProps<typeof propTypes>) => {
  const { t } = useTranslation()
  // In case of a reply the composer can be visually hidden after the comment has been submitted
  // due to the fact that the reply has a optimistic response
  const [hasSubmittedNewComment, setHasSubmittedNewComment] = useState(false)

  const { id: discussionId, discussion, overlays, activeTag } = useDiscussion()
  const { tags, rules, displayAuthor } = discussion
  const { preferencesOverlay } = overlays

  const { preferences, updateDiscussionPreferencesHandler } =
    useDiscussionPreferences(discussionId)

  const submitCommentHandler = useSubmitCommentHandler()
  const editCommentHandler = useEditCommentHandler()
  const previewCommentHandler = usePreviewCommentHandler()

  const automaticCredential = useMemo(() => {
    if (
      !preferences ||
      // the below line acts as a workaround for the case where the
      // user has already defined his credential as null
      preferences?.discussion?.userPreference?.notifications ||
      preferences?.discussion?.userPreference?.anonymity ||
      preferences?.discussion?.userPreference?.credential
    ) {
      return null
    }
    return preferences?.me?.credentials?.find(
      (credential) => credential.isListed,
    )
  }, [preferences])

  const [active, setActive] = useState(!!(initialText || initialActiveState))

  useEffect(() => {
    const draft = readDiscussionCommentDraft(discussionId, parentId)
    if (draft) {
      setActive(true)
    }
  }, [discussionId, parentId])

  // Create the submit-handler. In case a commentId was given, handle as edit
  const handleSubmit = async (value, tags) => {
    try {
      if (automaticCredential) {
        await updateDiscussionPreferencesHandler(
          false,
          automaticCredential.description,
        )
      }

      let response

      if (!commentId && !parentId) {
        // New root comment
        response = await submitCommentHandler(value, tags, {
          discussionId,
          parentId,
        })
      } else if (!commentId && parentId) {
        // Reply to a comment
        // No tags are passed since responses should not have tags!
        response = await submitCommentHandler(value, [], {
          discussionId,
          parentId,
        }).catch((err) => {
          // ensure that the compose is shown again in case of an error
          setHasSubmittedNewComment(false)
          throw err
        })
        setHasSubmittedNewComment(true)
      } else {
        // Edit a comment
        response = await editCommentHandler(commentId, value, tags)
      }

      return {
        ok: response,
      }
    } catch (err) {
      return {
        error: err,
      }
    }
  }

  if (hasSubmittedNewComment && !isRoot && !commentId) {
    return null
  }

  return (
    <DiscussionComposerBarrier
      isRoot={isRoot}
      isEditing={!!commentId}
      showPayNotes={showPayNotes}
    >
      {active ? (
        <CommentComposer
          t={t}
          isRoot={isRoot}
          isBoard={false}
          onCloseLabel={undefined}
          discussionId={discussion.id}
          hideHeader={false}
          parentId={parentId}
          commentId={commentId}
          onSubmit={({ text, tags = [] }) => handleSubmit(text, tags)}
          onSubmitLabel={
            initialText
              ? t('styleguide/comment/edit/submit')
              : parentId
              ? t('styleguide/CommentComposer/answer')
              : t('submitComment/rootSubmitLabel')
          }
          onClose={() => {
            setActive(false)
            if (onClose) {
              onClose()
            }
          }}
          onOpenPreferences={() =>
            preferencesOverlay.handleOpen(automaticCredential)
          }
          onPreviewComment={previewCommentHandler}
          hintValidators={composerHints(t)}
          secondaryActions={<SecondaryActions isReply={!!parentId} />}
          displayAuthor={{
            ...displayAuthor,
            credential: displayAuthor?.credential || automaticCredential,
          }}
          placeholder={placeholder}
          maxLength={rules?.maxLength}
          tags={tags}
          initialText={initialText}
          initialTagValue={
            // In case a reply is being composed, no tag-values should be passed
            !parentId && tags?.length > 0
              ? initialTagValue ?? activeTag
              : undefined
          }
        />
      ) : (
        <CommentComposerPlaceholder
          t={t}
          displayAuthor={displayAuthor ?? {}}
          onClick={() => setActive(true)}
          placeholder={placeholder}
        />
      )}
    </DiscussionComposerBarrier>
  )
}

export default DiscussionComposer

DiscussionComposer.propTypes = propTypes
