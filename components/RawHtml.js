import {createElement} from 'react'
import PropTypes from 'prop-types'

import {css} from 'glamor'
import {
  colors, fontFamilies
} from '@project-r/styleguide'

const styles = {
  default: css({
    '& a': {
      textDecoration: 'none',
      color: colors.primary,
      ':visited': {
        color: colors.primary
      },
      ':hover': {
        color: colors.secondary
      }
    },
    '& ul, & ol': {
      overflow: 'hidden'
    },
    '& .container169': {
      position: 'relative',
      height: 0,
      width: '100%',
      paddingBottom: `${9 / 16 * 100}%`
    },
    '& .containedVideo': {
      position: 'absolute',
      height: '100%',
      width: '100%',
      left: 0,
      top: 0
    }
  }),
  sansSerif: css({
    '& b': {
      fontFamily: fontFamilies.sansSerifMedium,
      fontWeight: 'normal'
    }
  }),
  serif: css({
    '& b': {
      fontFamily: fontFamilies.serifBold,
      fontWeight: 'normal'
    }
  })
}

const RawHtml = ({type, style, dangerouslySetInnerHTML}) => createElement(type, {
  ...styles.default,
  ...styles[style],
  dangerouslySetInnerHTML
})

RawHtml.defaultProps = {
  type: 'span',
  style: 'sansSerif'
}

RawHtml.propTypes = {
  style: PropTypes.oneOf(['serif', 'sansSerif']).isRequired
}

export default RawHtml
