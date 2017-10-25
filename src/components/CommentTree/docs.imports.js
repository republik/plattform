import React from 'react'
import SomeNode from './Node'
import * as allComments from './comments'

export {default as LoadMore} from './LoadMore'
export const comments = {...allComments}

export const Node = ({t, comment}) => (
  <SomeNode
    top
    t={t}
    displayAuthor={{
      profilePicture: '/static/profilePicture1.png',
      name: `Christof Moser`,
      credential: {description: 'Journalist', verified: true}
    }}
    comment={comment}
    timeago={() => '2h'}
    upvoteComment={() => {}}
    downvoteComment={() => {}}
    submitComment={() => {}}
    fetchMore={() => {}}
  />
)
