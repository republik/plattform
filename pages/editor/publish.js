import withData from '../../lib/apollo/withData'

import Frame from '../../components/Frame'
import EditFrame from '../../components/EditFrame'

export default withData(({ url: { query } }) => {
  const { repository, commit } = query
  return (
    <Frame>
      <EditFrame
        view={'publish'}
        repository={repository}
        commit={commit}
        spaceLeft
      >
        <h1>Publish</h1>
      </EditFrame>
    </Frame>
  )
})
