import { commentComposerStorageKey } from './CommentComposer'

/**
 * Load a stored draft an validate the schema.
 * @param key
 * @returns {{replies}|{text}|any|undefined}
 */
function loadStoredDraftsObject(key) {
  if (!localStorage) return undefined
  const storedValue = localStorage.getItem(key)
  if (!storedValue) return undefined

  // ---- Handle possible legacy drafts ----
  // check if the stored value is not a stringified object
  if (!storedValue.startsWith('{')) {
    const newValue = createDraftsObject()
    // assume the legacy-draft is a comment-draft -> save in text property
    newValue.text = storedValue
    localStorage.setItem(key, JSON.stringify(newValue))
    return newValue
  }

  try {
    const value = JSON.parse(storedValue)

    // Validate that the stored value has the correct shape
    if (
      'text' in value &&
      'replies' in value &&
      typeof value.replies === 'object'
    ) {
      return value
    }
    return undefined
  } catch (e) {
    // if an error occurs assume it's due to an invalid drafts-object
    localStorage.removeItem(key)
    return undefined
  }
}

// Create an empty drafts object
function createDraftsObject() {
  return {
    text: null,
    replies: {}
  }
}

/**
 * Get a saved draft for a comment or a reply from a persisted drafts-object.
 * @param discussionID discussionID defines what drafts-object should be loaded.
 * @param commentID optional commentId if a reply-draft should be loaded.
 */
export function readDraft(discussionID, commentID) {
  const storedDrafts = loadStoredDraftsObject(
    commentComposerStorageKey(discussionID)
  )
  if (!storedDrafts) return undefined

  // If no reply-draft is searched, return the comment-draft (possibly null)
  if (!commentID && 'text' in storedDrafts) return storedDrafts.text

  // If a reply-draft is searched make sure the drafts-object contains the needed key
  if (
    'replies' in storedDrafts &&
    typeof storedDrafts.replies === 'object' &&
    commentID in storedDrafts.replies
  )
    return storedDrafts.replies[commentID]

  return undefined
}

/**
 * Save a comment- or reply-draft inside a drafts-object.
 * @param discussionID discussion for which a draft should be saved
 * @param commentID put null if the value should be persisted for
 * @param value that should be saved as a draft
 */
export function saveDraft(discussionID, commentID, value) {
  const storageKey = commentComposerStorageKey(discussionID)
  let drafts = loadStoredDraftsObject(storageKey)

  // If no draft exists instantiate a new one.
  if (!drafts) {
    console.debug('Create a new draft object')
    drafts = createDraftsObject()
  }

  if (commentID) {
    console.debug('Updating reply draft')
    drafts.replies[commentID] = value
  } else {
    console.debug('Updating comment draft')
    drafts.text = value
  }
  console.log('Final updated draft', JSON.stringify(drafts))
  localStorage.setItem(storageKey, JSON.stringify(drafts))
}

/**
 * Delete a comment-draft or a reply-draft from a drafts-object.
 * If no value is present after the according value has been deleted,
 * get rid of the drafts-object.
 * @param discussionID discussion for which the drafts-object should be loaded.
 * @param commentID optional commentID if a reply-draft should be deleted.
 */
export function deleteDraft(discussionID, commentID) {
  const storageKey = commentComposerStorageKey(discussionID)
  let drafts = loadStoredDraftsObject(storageKey)
  if (!drafts) return undefined

  if (discussionID && !commentID) {
    delete drafts.text
  } else if (discussionID && commentID) {
    delete drafts.replies[commentID]
  }

  // If the drafts-object is empty delete it all together
  if (!drafts.text && Object.keys(drafts.replies).length === 0) {
    localStorage.removeItem(storageKey)
  } else {
    // If the drafts-object is not empty update it
    localStorage.setItem(storageKey, JSON.stringify(drafts))
  }
}
