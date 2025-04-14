import { usePaynoteKind } from '@app/lib/hooks/usePaynoteKind'

import { PaynoteContainer } from '../../ui/containers'

import Trial from './trial'
import Offers from './offers'

const Regwall = () => {
  const paynoteKind = usePaynoteKind()

  if (paynoteKind !== 'REGWALL') return null

  return (
    <PaynoteContainer>
      <Trial />
      <Offers />
    </PaynoteContainer>
  )
}

export default Regwall
