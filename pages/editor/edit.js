import withData from '../../lib/apollo/withData'
import EditorFrame from '../../lib/components/EditorFrame'

export default withData(({ url: { query } }) => {
  const { repository, commit } = query
  return (
    <EditorFrame view={'edit'} repository={repository} commit={commit}>
      <h1>Edit</h1>
    </EditorFrame>
  )
})
