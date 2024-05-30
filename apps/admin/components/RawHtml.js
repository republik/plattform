import { createElement } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { colors, fontFamilies } from '@project-r/styleguide'

const styles = {
  default: css({
    '& a': {
      textDecoration: 'none',
      color: colors.primary,
      ':visited': {
        color: colors.primary,
      },
      ':hover': {
        color: colors.secondary,
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

/**
 * RawHtmlProps
 * @typedef {object} RawHtmlProps
 * @property {string} type
 * @property {'serif' | 'sansSerif'} style
 * @property {{__html: string}} dangerouslySetInnerHTML
 */

/**
 * Raw HTML component
 * @param {RawHtmlProps} props
 * @returns {JSX.Element}
 */
function RawHtml({
  type = 'span',
  style = 'sansSerif',
  dangerouslySetInnerHTML,
}) {
  return createElement(type, {
    ...styles.default,
    ...styles[style],
    dangerouslySetInnerHTML,
  })
}

export default RawHtml
