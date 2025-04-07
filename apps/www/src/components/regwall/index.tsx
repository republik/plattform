import { css } from '@republik/theme/css'

import Trial from './trial'
import Offers from './offers'
import { RegwallContainer } from './containers'

const Regwall = () => {
  return (
    <RegwallContainer>
      <Trial />
      <Offers />
    </RegwallContainer>
  )
}

export default Regwall
