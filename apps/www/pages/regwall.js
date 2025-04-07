import { withDefaultSSR } from '../lib/apollo/helpers'
import Paywall from '@app/components/paywall'

const Page = () => {
  return <Paywall />
}

export default withDefaultSSR(Page)
