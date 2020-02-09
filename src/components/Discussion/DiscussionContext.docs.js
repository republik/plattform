import React from 'react'

/**
 * This here is only for documentation purposes, to give you an idea about the
 * shape of the context value. This value is provided to all components in
 * the documentation pages.
 */
export const createSampleDiscussionContextValue = ({ t }) => ({
  /**
   * Admin users have elevated priviledges, they can for example unpublish
   * any comment.
   */
  isAdmin: false,

  /**
   * The Discussion object, straight from the GraphQL server.
   */
  discussion: {
    id: '00000000-0000-0000-0000-000000000000',

    title: 'Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie',

    /**
     * This controls whether long comments can be collapsed.
     */
    collapsable: true,

    /**
     * The display author is optional, only provided if the user is
     * logged in.
     */
    displayAuthor: {
      name: 'Anonym',
      profilePicture: '/static/profilePicture1.png'
    },

    /**
     * ISO 8601 string. If set then the user must wait until that time before
     * they can write another comment.
     */
    userWaitUntil: null,

    rules: {
      maxLength: null
    },

    tags: [],
    tagRequired: false
  },

  /**
   * The ID of the comment that should be highlighted. It is optional.
   */
  highlightedCommentId: '3.1',

  /**
   * All the actions the user can do. These functions correspond mostly
   * to GraphQL mutations, though some are implemented purely in the
   * client-side JavaScript code.
   *
   * To allow them to be asynchronous, they all return a promise. Upon success
   * the promise resolves with `{ ok: true }`. Otherwise the promise resolves
   * with `{ error: string }`. The promise must not reject.
   */
  actions: {
    /**
     * Submit a new comment to the discussion. The parent comment can be null,
     * in which case a new top-level comment will be created. Otherwise it'll
     * be a reply to the given comment.
     */
    submitComment: (parent, text, tags) => Promise.resolve({ ok: true }),

    editComment: (comment, content, tags) => Promise.resolve({ ok: true }),
    upvoteComment: comment => Promise.resolve({ ok: true }),
    downvoteComment: comment => Promise.resolve({ ok: true }),
    unvoteComment: comment => Promise.resolve({ ok: true }),
    unpublishComment: comment => Promise.resolve({ ok: true }),

    /**
     * Fetch more comments.
     */
    fetchMoreComments: ({ parentId, after, appendAfter }) =>
      Promise.resolve({ ok: true }),

    shareComment: commentId => Promise.resolve({ ok: true }),
    openDiscussionPreferences: () => Promise.resolve({ ok: true })
  },

  /**
   * The current time, isDesktop and a translate function for timeahead, timeago and timeduration.
   */
  clock: {
    now: Date.now(),
    isDesktop: true,
    t
  },

  /**
   * When components need to create links to other parts of the website, they can use this component.
   */
  Link: ({ displayAuthor, discussion, comment, passHref, ...props }) => (
    <React.Fragment {...props} />
  ),

  /**
   * React Element that will be placed into the secondary actions slot of the
   * composer. Can be null to not show anything.
   */
  composerSecondaryActions: null
})
