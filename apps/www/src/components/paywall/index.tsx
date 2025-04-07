import { RegwallContainer } from '../regwall/containers'
import { Offers } from './offers'

function Paywall() {
  return (
    <RegwallContainer>
      <Offers />
    </RegwallContainer>
  )
}
export default Paywall
