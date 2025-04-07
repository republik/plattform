import { css } from '@republik/theme/css'

import { RegwallContainer } from '../regwall/containers'
import Login from '../regwall/login'

import { Offers } from './offers'

function Paywall() {
  return (
    <RegwallContainer>
      <Offers />
      <div className={css({ padding: '4-6' })}>
        <Login />
      </div>
    </RegwallContainer>
  )
}
export default Paywall
