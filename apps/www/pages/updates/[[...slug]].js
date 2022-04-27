import Frame from '../../components/Frame'

import List from '../../components/Updates/List'
import withDefaultSSR from '../../lib/hocs/withDefaultSSR'

const UpdatesPage = ({ serverContext }) => (
  <Frame raw>
    <List serverContext={serverContext} />
  </Frame>
)

export default withDefaultSSR(UpdatesPage)
