import compose from 'lodash/flowRight'
import withAuthorization from '../../components/Auth/withAuthorization'
import { withDefaultSSR } from '../../lib/apollo/helpers'

const Event = () => {
  return <div>1 Event</div>
}

export default withDefaultSSR(compose(withAuthorization(['editor']))(Event))
