import withData from '../../lib/apollo/withData'
import EditorFrame from '../../lib/components/EditorFrame'

export default withData(({ url: { query } }) => {
  const { repository, commit } = query
  return (
    <EditorFrame view={'meta'} repository={repository} commit={commit}>
      <h1>Meta</h1>
    </EditorFrame>
  )
})
