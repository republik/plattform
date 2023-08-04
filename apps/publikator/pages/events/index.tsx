import compose from 'lodash/flowRight'
import withAuthorization from '../../components/Auth/withAuthorization'
import { withDefaultSSR } from '../../lib/apollo/helpers'

const Events = () => {
  return <div>Hello</div>
}

export default withDefaultSSR(compose(withAuthorization(['editor']))(Events))
