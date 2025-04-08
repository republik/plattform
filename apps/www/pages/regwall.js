import { withDefaultSSR } from '../lib/apollo/helpers'
import Paywall from '@app/components/paywall'
import Regwall from '@app/components/regwall'

const Page = () => {
  return <Regwall />
}

export default withDefaultSSR(Page)
