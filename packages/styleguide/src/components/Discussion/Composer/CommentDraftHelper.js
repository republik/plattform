/**
 * The key in localStorage under which we store the drafts. Keyed by the discussion id.
 */
export const commentComposerStorageKey = (discussionId) =>
  `commentComposerText:${discussionId}`

/**
 * Load a stored draft an validate the schema.
 * @param key
 * @returns {{replies}|{text}|any|undefined}
 */
function loadStoredDraftsObject(key) {
  let storedValue
  try {
    storedValue = localStorage.getItem(key)
  } catch (e) {}
  if (!storedValue) return undefined

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
    const newValue = createDraftsObject()
    // assume the legacy-draft is a comment-draft -> save in text property
    newValue.text = storedValue
    try {
      localStorage.setItem(key, JSON.stringify(newValue))
    } catch (e) {}
    return newValue
  }
}

// Create an empty drafts object
function createDraftsObject() {
  return {
    text: null,
    replies: {},
  }
}

/**
 * Get a saved draft for a comment or a reply from a persisted drafts-object.
 * @param discussionID discussionID defines what drafts-object should be loaded.
 * @param commentID optional commentId if a reply-draft should be loaded.
 */
export function readDraft(discussionID, commentID) {
  const storedDrafts = loadStoredDraftsObject(
    commentComposerStorageKey(discussionID),
  )
  if (!storedDrafts) return undefined

  // If no reply-draft is searched, return the comment-draft (possibly null)
  if (!commentID) return storedDrafts.text

  return storedDrafts.replies[commentID] ?? undefined
}

/**
 * Save a comment- or reply-draft inside a drafts-object.
 * @param discussionID discussion for which a draft should be saved
 * @param commentID put null if the value should be persisted for
 * @param value that should be saved as a draft
 */
export function writeDraft(discussionID, commentID, value) {
  const storageKey = commentComposerStorageKey(discussionID)
  let drafts = loadStoredDraftsObject(storageKey) ?? createDraftsObject()

  // If the new value is an empty string (which is falsy in JS)
  // Delete the according draft
  if (!value.trim()) {
    deleteDraft(discussionID, commentID)
    return
  }

  if (commentID) {
    drafts.replies[commentID] = value
  } else {
    drafts.text = value
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(drafts))
  } catch (e) {}
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

  if (!commentID) {
    drafts.text = null
  } else if (commentID) {
    delete drafts.replies[commentID]
  }

  // If the drafts-object is empty delete it all together
  if (!drafts.text && Object.keys(drafts.replies).length === 0) {
    try {
      localStorage.removeItem(storageKey)
    } catch (e) {}
  } else {
    // If the drafts-object is not empty update it
    try {
      localStorage.setItem(storageKey, JSON.stringify(drafts))
    } catch (e) {}
  }
}
