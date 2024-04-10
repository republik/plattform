import { css } from 'glamor'
import React from 'react'
import { mUp } from '../TeaserFront/mediaQueries'
import {
  sansSerifMedium16,
  sansSerifMedium22,
  sansSerifRegular30,
} from '../Typography/styles'
import { IconChevronRight } from '@republik/icons'

const styles = {
  container: css({
    display: 'block',
    marginBottom: 15,
    ...sansSerifMedium22,
    textDecoration: 'none',
    '& svg': {
      display: 'inline',
      width: 22,
      height: 22,
      marginLeft: 8,
    },
    [mUp]: {
      ...sansSerifRegular30,
      '& svg': {
        width: 30,
        height: 30,
      },
      marginBottom: 25,
    },
    color: 'inherit',
  }),
  small: css({
    color: 'inherit',
    ...sansSerifMedium16,
    textDecoration: 'none',
    '& svg': {
      display: 'inline',
      marginTop: -1,
      width: 16,
      height: 16,
      marginLeft: 4,
    },
  }),
}

const SectionTitle = React.forwardRef(
  ({ children, small, onClick, href, clickable }, ref) => {
    const style = small ? styles.small : styles.container
    return href ? (
      <a href={href} onClick={onClick} {...style} ref={ref}>
        {children}
        {<IconChevronRight />}
      </a>
    ) : (
      <span onClick={onClick} {...style} ref={ref}>
        {children}
        {!!clickable && <IconChevronRight />}
      </span>
    )
  },
)

export default SectionTitle
