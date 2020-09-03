import { css } from 'glamor'
import React from 'react'
import ChevronRight from 'react-icons/md/keyboard-arrow-right'
import { mUp } from '../TeaserFront/mediaQueries'
import {
  sansSerifMedium16,
  sansSerifMedium22,
  sansSerifRegular30
} from '../Typography/styles'

const styles = {
  container: css({
    display: 'block',
    marginBottom: 15,
    ...sansSerifMedium22,
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
      },
      marginBottom: 25
    },
    color: 'inherit'
  }),
  small: css({
    color: 'inherit',
    ...sansSerifMedium16,
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

const SectionTitle = React.forwardRef(
  ({ children, small, onClick, href }, ref) => {
    const style = small ? styles.small : styles.container
    return href ? (
      <a href={href} onClick={onClick} {...style} {...styles.link} ref={ref}>
        {children}
        {<ChevronRight />}
      </a>
    ) : (
      <span onClick={onClick} {...style} ref={ref}>
        {children}
      </span>
    )
  }
)

export default SectionTitle
