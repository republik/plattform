import { css } from '@republik/theme/css'

import { PaynoteContainer } from '../ui/containers'
import Login from '../regwall/login'

import { Offers } from './offers'

function Paywall() {
  return (
    <PaynoteContainer>
      <Offers />
      <div className={css({ padding: '4-6' })}>
        <Login />
      </div>
    </PaynoteContainer>
  )
}
export default Paywall
