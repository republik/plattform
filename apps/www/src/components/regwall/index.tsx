import { css } from '@republik/theme/css'

import Trial from './trial'
import Offers from './offers'
import { PaynoteContainer } from '../ui/containers'

const Regwall = () => {
  return (
    <PaynoteContainer>
      <Trial />
      <Offers />
    </PaynoteContainer>
  )
}

export default Regwall
