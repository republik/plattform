import { createElement } from 'react'
import { css, merge } from 'glamor'
import { linkBlackStyle, linkStyle } from '../Typography'
import PropTypes from 'prop-types'

const styles = {
  default: css({
    '& a': linkStyle,
    '& ul, & ol': {
      overflow: 'hidden'
    }
  }),
  black: css({
    '& a': linkBlackStyle
  })
}

const RawHtml = ({type, dangerouslySetInnerHTML, black}) => createElement(type, {
  ...merge(styles.default, black && styles.black),
  dangerouslySetInnerHTML
})

RawHtml.defaultProps = {
  type: 'span'
}

RawHtml.propTypes = {
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
}

export default RawHtml
