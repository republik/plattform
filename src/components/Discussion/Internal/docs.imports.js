import React from 'react'
import { Editorial } from '../../Typography'
import * as allComments from '../__docs__/comments'
import { exampleShortMdast, exampleLongMdast } from '../__docs__/exampleMdast'

import * as CommentComponents from './Comment'
import * as ComposerComponents from './Composer'

export { default as MdMarkdown } from 'react-icons/lib/go/markdown'
export { default as MdMood } from 'react-icons/lib/md/mood'

export { DiscussionContext } from '../DiscussionContext'
export { LoadMore1 } from '../Tree/LoadMore'
export const Comment = { ...CommentComponents }
export const Composer = { ...ComposerComponents }

export const comments = {
  // Normal comment
  comment1: {
    ...allComments.comment2
  },

  // Unpublished comment
  comment2: {
    ...allComments.comment2,
    published: false,
    content: undefined
  },

  // Unpublished (retracted) by the user itself
  comment3: {
    ...allComments.comment2,
    content: exampleShortMdast,
    published: false,
    userCanEdit: true
  },

  // Unpublished (retracted) by an admin
  comment4: {
    ...allComments.comment2,
    content: exampleShortMdast,
    published: false,
    userCanEdit: true,
    adminUnpublished: true
  },

  // Normal comment with overflowing content
  comment5: {
    ...allComments.comment1,
    content: exampleLongMdast
  },

  // Deeply nested comment
  comment6: {
    ...allComments.comment1,
    parentIds: Array.from({ length: 8 }, (_, i) => `6.${i}`)
  },

  // Comment with Preview
  comment7: {
    ...allComments.comment2,
    embed: allComments.linkPreview1
  },

  // Comment with Tweet
  comment8: {
    ...allComments.comment2,
    embed: allComments.linkPreview2
  },

  // Comment with Preview and Top Story
  comment9: {
    ...allComments.comment2,
    embed: allComments.linkPreview1,
    mentioningDocument: allComments.mentioningDocument
  }
}

export const commentContext = {
  title: 'Der Crowdfunding-Code gegen die Frankenstein-Monster-Strategie',
  description: (
    <span>
      Ein Artikel von <Editorial.A href='/foo'>Christof Moser</Editorial.A>
    </span>
  )
}
