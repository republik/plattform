import { css } from 'glamor'
import React from 'react'
import ChevronRight from 'react-icons/lib/md/keyboard-arrow-right'

import { sansSerifRegular30 } from '../Typography/styles'

const styles = {
  link: css({
    textDecoration: 'none',
    color: '#000000',
    display: 'inline-block',
    cursor: 'pointer',
    ...sansSerifRegular30,
    margin: '0 0 30px 0'
  }),
  label: css({
    display: 'inline-block',
    ...sansSerifRegular30,
    margin: '0 0 30px 0'
  }),
  icon: css({
    marginLeft: '8px'
  })
}

const Title = ({ children, onClick, href }) => {
  return href ? (
    <a href={href} onClick={onClick} {...styles.link}>
      {children}
      {<ChevronRight {...styles.icon} size={30} />}
    </a>
  ) : (
    <div onClick={onClick} {...styles.label}>
      {children}
    </div>
  )
}

export default Title
