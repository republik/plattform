import React from 'react'
import SomeNode from './Node'
import * as allComments from './comments'

export {default as LoadMore} from './LoadMore'

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

export const Node = props => (
  <SomeNode
    Node={Node}
    t={t}
    {...props}
  />
)

export const comments = {...allComments}
