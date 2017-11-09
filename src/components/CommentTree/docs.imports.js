import React from 'react'

import SomeRow from './Row'
import SomeNode from './Node'

import * as allComments from './comments'
import LoadMore from './LoadMore'

export {default as LoadMore} from './LoadMore'
export {default as Collapse} from './Collapse'

export const comments = {...allComments}

export const Row = (props) => (
  <SomeRow
    head={false}
    tail={false}
    displayAuthor={{
      profilePicture: '/static/profilePicture1.png',
      name: `Christof Moser`,
      credential: {description: 'Journalist', verified: true}
    }}
    showComposer={false}
    onEditPreferences={() => {}}
    onAnswer={() => {}}
    onUpvote={() => {}}
    onDownvote={() => {}}
    dismissComposer={() => {}}
    submitComment={() => {}}
    timeago={() => '2h'}
    {...props}
  />
)

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
    onEditPreferences={() => {}}
    upvoteComment={() => {}}
    downvoteComment={() => {}}
    submitComment={() => {}}
    More={({visualDepth, connected, comment: {comments}}) => {
      if (comments && comments.pageInfo && comments.pageInfo.hasNextPage) {
        return (
          <LoadMore
            t={t}
            visualDepth={visualDepth}
            connected={connected}
            count={comments.totalCount - (comments.nodes || []).length}
            onClick={() => {}}
          />
        )
      } else {
        return null
      }
    }}
  />
)
