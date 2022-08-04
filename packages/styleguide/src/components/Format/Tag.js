import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import {
  sansSerifMedium14,
  sansSerifMedium16,
  sansSerifMedium18,
  sansSerifMedium20,
} from '../Typography/styles'
import { mUp } from '../../theme/mediaQueries'
import { useColorContext } from '../Colors/useColorContext'
import { AccessibilityStyles } from '../../lib/accessibility/styles'

const styles = {
  container: css({
    ...sansSerifMedium18,
    display: 'inline-block',
    padding: 0,
    margin: '0 10px 5px 0',
    [mUp]: {
      ...sansSerifMedium20,
      margin: '0 20px 5px 0',
    },
  }),
  count: css({
    ...sansSerifMedium14,
    marginLeft: 5,
    [mUp]: {
      ...sansSerifMedium16,
    },
  }),
}

const FormatTag = ({ label, count, color, selected, srSelectedText, t }) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...styles.container} {...colorScheme.set('color', color, 'format')}>
      {label}
      {count !== undefined && (
        <span {...styles.count} {...colorScheme.set('color', 'textSoft')}>
          {count}
          {t && (
            <span {...AccessibilityStyles.srOnly}>
              {t('styleguide/Tag/count')}
            </span>
          )}
        </span>
      )}
      {selected && srSelectedText && (
        <span {...AccessibilityStyles.srOnly}>{srSelectedText}</span>
      )}
    </div>
  )
}

FormatTag.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.number,
  color: PropTypes.string,
  selected: PropTypes.bool,
  srSelectedText: PropTypes.string,
}

export default FormatTag
