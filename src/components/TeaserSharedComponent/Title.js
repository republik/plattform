import { css } from 'glamor'
import React from 'react'
import ChevronRight from 'react-icons/lib/md/keyboard-arrow-right'
import { mUp } from '../TeaserFront/mediaQueries'
import { sansSerifRegular22, sansSerifRegular30 } from '../Typography/styles'

const styles = {
  link: css({
    ...sansSerifRegular22,
    textDecoration: 'none',
    color: '#000000',
    display: 'inline-block',
    cursor: 'pointer',
    margin: '0 0 30px 0',
    [mUp]: {
      ...sansSerifRegular30
    }
  }),
  label: css({
    ...sansSerifRegular22,
    display: 'inline-block',
    margin: '0 0 30px 0',
    [mUp]: {
      ...sansSerifRegular30
    }
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
