import { createElement } from 'react'
import { css, merge } from 'glamor'
import { linkBlackStyle, linkErrorStyle, linkStyle } from '../Typography'
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
  error: css({
    color: colors.error,
    '& a': linkErrorStyle
  })
}

const RawHtml = ({type, dangerouslySetInnerHTML, black, error}) => createElement(type, {
  ...merge(styles.default, error && styles.error, black && styles.black),
  dangerouslySetInnerHTML
})

RawHtml.defaultProps = {
  type: 'span'
}

RawHtml.propTypes = {
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
}

export default RawHtml
