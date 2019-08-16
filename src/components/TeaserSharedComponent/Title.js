import { css } from 'glamor'
import React from 'react'
import ChevronRight from 'react-icons/lib/md/keyboard-arrow-right'
import { mUp } from '../TeaserFront/mediaQueries'
import { sansSerifRegular22, sansSerifRegular30 } from '../Typography/styles'

const styles = {
  container: css({
    ...sansSerifRegular22,
    [mUp]: {
      ...sansSerifRegular30
    },
    display: 'block',
    margin: '0 0 30px 0',
    color: 'inherit'
  }),
  link: css({
    textDecoration: 'none',
    cursor: 'pointer'
  }),
  icon: css({
    marginLeft: '8px'
  })
}

const Title = ({ children, onClick, href }) => {
  return href ? (
    <a href={href} onClick={onClick} {...styles.link} {...styles.container}>
      {children}
      {<ChevronRight {...styles.icon} size={30} />}
    </a>
  ) : (
    <span onClick={onClick} {...styles.container}>
      {children}
    </span>
  )
}

export default Title
