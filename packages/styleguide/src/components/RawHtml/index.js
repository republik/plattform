import React, { useMemo } from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import { useColorContext } from '../Colors/useColorContext'
import { underline } from '../../lib/styleMixins'

const styles = {
  default: css({
    '& ul, & ol': {
      overflow: 'hidden',
    },
  }),
}

const RawHtml = ({ type: Type, dangerouslySetInnerHTML, error }) => {
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

RawHtml.defaultProps = {
  type: 'span',
}

RawHtml.propTypes = {
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
}

export default RawHtml
