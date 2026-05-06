import { fontFamilies } from '@project-r/styleguide'
import { css } from '@republik/theme/css'
import PropTypes from 'prop-types'
import { createElement } from 'react'

const styles = {
  default: css({
    '& a': {
      textDecoration: 'none',
      color: 'primary',
      ':visited': {
        color: 'primary',
      },
      ':hover': {
        color: 'secondary',
      },
    },
    '& ul, & ol': {
      overflow: 'hidden',
    },
    '& .container169': {
      position: 'relative',
      height: 0,
      width: '100%',
      paddingBottom: `${(9 / 16) * 100}%`,
    },
    '& .containedVideo': {
      position: 'absolute',
      height: '100%',
      width: '100%',
      left: 0,
      top: 0,
    },
  }),
  sansSerif: css({
    '& b': {
      fontFamily: fontFamilies.sansSerifMedium,
      fontWeight: 'normal',
    },
  }),
  serif: css({
    '& b': {
      fontFamily: fontFamilies.serifBold,
      fontWeight: 'normal',
    },
  }),
}

const RawHtml = ({
  type = 'span',
  style = 'sansSerif',
  dangerouslySetInnerHTML,
}) =>
  createElement(type, {
    ...styles.default,
    ...styles[style],
    dangerouslySetInnerHTML,
  })

RawHtml.propTypes = {
  style: PropTypes.oneOf(['serif', 'sansSerif']).isRequired,
}

export default RawHtml
