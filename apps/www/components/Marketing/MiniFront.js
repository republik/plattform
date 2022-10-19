import Loader from '../Loader'
import { RenderFront } from '../Front'

const MiniFront = ({ loading, error, front }) => (
  <Loader
    loading={loading}
    error={error}
    render={() =>
      front ? <RenderFront front={front} nodes={front.children.nodes} /> : null
    }
  />
)

export default MiniFront
