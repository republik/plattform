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

type FormatTagProps = {
  label: string
  count?: number
  color?: string
}

const FormatTag = ({ label, count, color }: FormatTagProps) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...styles.container} {...colorScheme.set('color', color, 'format')}>
      {label}
      {count !== undefined && (
        <span {...styles.count} {...colorScheme.set('color', 'textSoft')}>
          {count}
        </span>
      )}
    </div>
  )
}

export default FormatTag
