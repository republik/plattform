import { useMemo } from 'react'

import { css } from 'glamor'
import {
  fontStyles,
  mediaQueries,
  Editorial,
  useColorContext,
} from '@project-r/styleguide'

const styles = {
  p: css({
    ...fontStyles.sansSerifRegular16,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular21,
    },
    margin: 0,
  }),
}

export const P = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p {...styles.p} {...colorScheme.set('color', 'text')} {...props}>
      {children}
    </p>
  )
}

export const A = ({ children, ...props }) => {
  return <Editorial.A {...props}>{children}</Editorial.A>
}

export const Highlight = ({
  ids,
  format,
  series,
  children,
  highlight: highlightProps,
  onHighlight,
}) => {
  const [colorScheme] = useColorContext()
  const highlight = useMemo(
    () => (data) => {
      if (ids && ids.includes(data.id)) {
        return true
      }
      if (data.urlMeta) {
        if (format && data.urlMeta.format === format) {
          return true
        }
        if (series && data.urlMeta.series === series) {
          return true
        }
      }
    },
    [ids && ids.join('|'), format, series],
  )
  const isHighlighted = highlight === highlightProps
  return (
    <Editorial.A
      style={{
        textDecoration: 'none',
        borderBottomWidth: 1,
        borderBottomStyle: 'dotted',
        cursor: 'default',
      }}
      {...colorScheme.set('color', isHighlighted ? 'textSoft' : 'text')}
      {...colorScheme.set('borderColor', isHighlighted ? 'textSoft' : 'text')}
      onMouseEnter={() => {
        onHighlight(highlight)
      }}
      onMouseLeave={() => {
        onHighlight()
      }}
    >
      {children}
    </Editorial.A>
  )
}
