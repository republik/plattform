import { createElement } from 'react'
import { css } from 'glamor'
import { link } from '../Typography/styles'
import PropTypes from 'prop-types'

const styles = {
  default: css({
    '& a': {
      ...link
    },
    '& ul, & ol': {
      overflow: 'hidden'
    }
  })
}

const RawHtml = ({type, dangerouslySetInnerHTML}) => createElement(type, {
  ...styles.default,
  dangerouslySetInnerHTML
})

RawHtml.defaultProps = {
  type: 'span'
}

RawHtml.propTypes = {
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
}

export default RawHtml
