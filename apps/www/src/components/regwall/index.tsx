import { css } from '@republik/theme/css'

import Trial from './Trial'
import Offers from './Offers'

const Regwall = () => {
  return (
    <div
      className={css({
        borderTop: '2px solid',
        borderColor: 'text.black',
        mt: '4',
      })}
    >
      <Trial />
      <Offers />
    </div>
  )
}

export default Regwall
