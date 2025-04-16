import { usePaynotes } from '@app/components/paynotes/paynotes-context'

import { PaynoteContainer } from '../../ui/containers'

import Trial from './trial'
import Offers from './offers'

const Regwall = () => {
  const { paynoteKind } = usePaynotes()

  if (paynoteKind !== 'REGWALL') return null

  return (
    <PaynoteContainer>
      <Trial />
      <Offers />
    </PaynoteContainer>
  )
}

export default Regwall
