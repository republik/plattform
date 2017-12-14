import React from 'react'
import { getInitials } from '../../lib/utils/name'
import { css } from 'glamor'
import { HEADER_HEIGHT } from './constants'
import withMe from '../../lib/withMe'

const styles = {
  portrait: css({
    height: HEADER_HEIGHT - 1,
    marginLeft: 5,
    verticalAlign: 'top'
  }),
  initials: css({
    display: 'inline-block',
    marginLeft: 5,
    verticalAlign: 'top',
    textAlign: 'center',
    backgroundColor: '#ccc',
    color: '#000',
    textTransform: 'uppercase',
    width: HEADER_HEIGHT - 1,
    height: HEADER_HEIGHT - 1,
    paddingTop: 28,
    fontSize: 20
  })
}

export const Me = ({ me }) => (
  <div>
    <a
      href='/'
      onClick={e => {
        e.preventDefault()
      }}
  >
      {me.portrait
      ? <img src={me.portrait.url} {...styles.portrait} />
      : (
        <span {...styles.initials}>
          {getInitials(me)}
        </span>
        )
    }
    </a>
  </div>
)

export default withMe(Me)
