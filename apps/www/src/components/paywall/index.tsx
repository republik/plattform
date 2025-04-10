import { PaynoteContainer } from '../ui/containers'

import { Offers } from './offers'

// Assumptions:
// - the Paywall is only shown to user who are logged in
// - users who are not logged in will always see the Regwall
function Paywall() {
  return (
    <PaynoteContainer>
      <Offers />
    </PaynoteContainer>
  )
}
export default Paywall
