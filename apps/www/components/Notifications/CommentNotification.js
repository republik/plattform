import { CommentTeaser, useColorContext } from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import withT from '../../lib/withT'
import CommentLink from '../Discussion/shared/CommentLink'

export default compose(withT)(({ t, node, isNew }) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...(isNew ? colorScheme.set('backgroundColor', 'alert') : null)}>
      <CommentTeaser
        {...node.object}
        context={{
          title: node.object.discussion.title,
        }}
        preview={node.object.preview}
        CommentLink={CommentLink}
        t={t}
        highlighted={isNew}
      />
    </div>
  )
})
