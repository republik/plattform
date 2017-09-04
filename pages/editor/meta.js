import withData from '../../lib/apollo/withData'

import Frame from '../../components/Frame'
import RepoNav from '../../components/Repo/Nav'

export default withData(({ url }) => {
  return (
    <Frame url={url} nav={<RepoNav route='editor/meta' url={url} />}>
      <h1>Metadaten</h1>
    </Frame>
  )
})
