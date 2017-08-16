import withData from '../../lib/apollo/withData'
import EditorFrame from '../../lib/components/EditorFrame'

export default withData(({ url: { query } }) => {
  const { repository, commit } = query
  return (
    <EditorFrame view={'publish'} repository={repository} commit={commit}>
      <h1>Publish</h1>
    </EditorFrame>
  )
})
