import { css } from 'glamor'
import React from 'react'
import ChevronRight from 'react-icons/lib/md/keyboard-arrow-right'
import { mUp } from '../TeaserFront/mediaQueries'
import { sansSerifRegular16, sansSerifRegular22, sansSerifRegular30 } from '../Typography/styles'

const styles = {
  container: css({
    ...sansSerifRegular22,
    '& svg': {
      width: 22,
      height: 22,
      marginLeft: 8
    },
    [mUp]: {
      ...sansSerifRegular30,
      '& svg': {
        width: 30,
        height: 30
      }
    },
    display: 'block',
    margin: '0 0 30px 0',
    color: 'inherit'
  }),
  small: css({
    color: 'inherit',
    ...sansSerifRegular16,
    '& svg': {
      marginTop: -1,
      width: 16,
      height: 16,
      marginLeft: 4
    }
  }),
  link: css({
    textDecoration: 'none'
  })
}

const SectionTitle = ({ children, small, onClick, href }) => {
  const style = small ? styles.small : styles.container
  return href ? (
    <a href={href} onClick={onClick} {...style} {...styles.link}>
      {children}
      {<ChevronRight />}
    </a>
  ) : (
    <span onClick={onClick} {...style}>
      {children}
    </span>
  )
}

export default SectionTitle
