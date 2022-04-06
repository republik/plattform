import Credentials from './Credentials'
import Suspensions from './DiscussionSuspensions'

import { css } from 'glamor'

const styles = {
  row: css({
    display: 'flex',
  }),
  fifty: css({
    width: '50%',
  }),
}

const Dialog = ({ userId }) => {
  return (
    <div {...styles.row}>
      <div {...styles.fifty}>
        <Credentials userId={userId} />
      </div>
      <div {...styles.fifty}>
        <Suspensions userId={userId} />
      </div>
    </div>
  )
}

export default Dialog
