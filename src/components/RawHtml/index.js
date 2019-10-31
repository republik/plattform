import { createElement } from 'react'
import { css, merge } from 'glamor'
import { linkBlackStyle, linkErrorStyle, linkErrorStyleNegative, linkStyle } from '../Typography'
import PropTypes from 'prop-types'
import colors from '../../theme/colors'

const styles = {
  default: css({
    '& a': linkStyle,
    '& ul, & ol': {
      overflow: 'hidden'
    }
  }),
  black: css({
    color: '#000000',
    '& a': linkBlackStyle
  }),
  white: css({
    color: colors.negative.text,
  }),
  error: css({
    color: colors.error,
    '& a': linkErrorStyle
  }),
  errorWhite: css({
    color: colors.negative.error,
    '& a': linkErrorStyleNegative
  })
}

const RawHtml = ({type, dangerouslySetInnerHTML, black, white, error}) => createElement(type, {
  ...merge(
    styles.default,
    black && styles.black,
    white && styles.white,
    error && styles.error,
    error && white && styles.errorWhite),
  dangerouslySetInnerHTML
})

RawHtml.defaultProps = {
  type: 'span'
}

RawHtml.propTypes = {
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
}

export default RawHtml
