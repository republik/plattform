import { css } from 'glamor'
import React from 'react'
import ChevronRight from 'react-icons/lib/md/keyboard-arrow-right'
import { mUp } from '../TeaserFront/mediaQueries'
import {
  sansSerifMedium16,
  sansSerifMedium22,
  sansSerifRegular30
} from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'

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
    const [colorScheme] = useColorContext()
    const style = small ? styles.small : styles.container
    return href ? (
      <a
        href={href}
        onClick={onClick}
        {...css(style, styles.link, { color: colorScheme.text })}
        ref={ref}
      >
        {children}
        {<ChevronRight />}
      </a>
    ) : (
      <span
        onClick={onClick}
        {...css(style, { color: colorScheme.text })}
        ref={ref}
      >
        {children}
      </span>
    )
  }
)

export default SectionTitle
