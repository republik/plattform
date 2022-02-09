import React from 'react'
import CommentLink from '../Discussion/shared/CommentLink'
import { CommentTeaser } from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import withT from '../../lib/withT'

export default compose(withT)(({ t, node }) => {
  return (
    <CommentTeaser
      {...node.entity}
      context={{
        title: node.entity.discussion.title,
      }}
      highlights={
        node.highlights &&
        // ToDo: support all path in styleguide
        node.highlights.filter((h) => h.path === 'contentString')
      }
      CommentLink={CommentLink}
      t={t}
    />
  )
})
