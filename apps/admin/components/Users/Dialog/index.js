'use client'

import Credentials from './Credentials'
import Suspensions from './DiscussionSuspensions'

import { css } from '@republik/theme/css'

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
    <div className={styles.row}>
      <div className={styles.fifty}>
        <Credentials userId={userId} />
      </div>
      <div className={styles.fifty}>
        <Suspensions userId={userId} />
      </div>
    </div>
  )
}

export default Dialog
