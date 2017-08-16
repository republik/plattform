import withData from '../../lib/apollo/withData'
import EditorFrame from '../../lib/components/EditorFrame'

export default withData(({ url: { query } }) => {
  const { repository, commit } = query
  return (
    <EditorFrame
      view={'tree'}
      repository={repository}
      commit={commit}
      spaceLeft
    >
      <h1>Tree</h1>
    </EditorFrame>
  )
})
