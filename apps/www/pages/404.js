import Frame from '../components/Frame'
import StatusError from '../components/StatusError'

const NotFound = ({ serverContext }) => (
  <Frame raw>
    <StatusError statusCode={404} serverContext={serverContext} />
  </Frame>
)

export default NotFound
