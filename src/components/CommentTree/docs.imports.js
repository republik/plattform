import React from 'react'
import SomeNode from './Node'
import * as allComments from './comments'

export {default as LoadMore} from './LoadMore'
export const comments = {...allComments}

export const t = (k, o) => {
  switch (k) {
    case 'components/Comment/CommentActions/answer':
      return 'Antworten'
    case 'components/CommentComposer/CommentComposer/placeholder':
      return 'Einen Kommentar verfassen…'
    case 'components/CommentComposer/CommentComposer/answer':
      return 'Antworten'
    case 'components/CommentTree/LoadMore/label':
      return `${o.count} weitere Kommentare`
    default:
      return ''
  }
}

export const Node = ({comment}) => (
  <SomeNode
    top
    t={t}
    displayAuthor={{
      profilePicture: '/static/profilePicture1.png',
      name: 'Paul Ullrich',
      credential: {
        description: 'Bundesrat',
        verified: false
      }
    }}
    comment={comment}
    timeago={() => '2h'}
  />
)
