import React, { useMemo } from 'react'
import { css } from 'glamor'
import { useColorContext } from '../Colors/useColorContext'
import { underline } from '../../lib/styleMixins'

const styles = {
  default: css({
    '& ul, & ol': {
      overflow: 'hidden',
    },
  }),
}

type RawHtmlProps = {
  type?: React.ElementType
  dangerouslySetInnerHTML: {
    __html: string
  }
  error?: boolean
}

const RawHtml = ({
  type: Type = 'span',
  dangerouslySetInnerHTML,
  error,
}: RawHtmlProps) => {
  const [colorScheme] = useColorContext()
  const colorRule = useMemo(
    () =>
      css({
        color: colorScheme.getCSSColor(error ? 'error' : 'text'),
        '& a': {
          ...underline,
          color: colorScheme.getCSSColor(error ? 'error' : 'text'),
          '@media (hover)': {
            ':hover': {
              color: colorScheme.getCSSColor(error ? 'error' : 'textSoft'),
            },
          },
        },
      }),
    [colorScheme, error],
  )

  return (
    <Type
      {...styles.default}
      {...colorRule}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    />
  )
}

export default RawHtml
