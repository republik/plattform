import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import {
  sansSerifMedium12,
  sansSerifMedium14,
  sansSerifMedium16,
  sansSerifMedium19
} from '../Typography/styles'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  container: css({
    ...sansSerifMedium16,
    display: 'inline-block',
    padding: 0,
    margin: '0 10px 5px 0',
    [mUp]: {
      ...sansSerifMedium19,
      margin: '0 20px 5px 0'
    }
  }),
  count: css({
    ...sansSerifMedium12,
    color: '#b4b4b4',
    marginLeft: 5,
    [mUp]: {
      ...sansSerifMedium14
    }
  })
}

class FormatTag extends Component {
  render() {
    const { label, count, color } = this.props
    return (
      <div {...styles.container} style={{ color }}>
        {label}
        {count !== undefined && <span {...styles.count}>{count}</span>}
      </div>
    )
  }
}

FormatTag.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.number,
  color: PropTypes.string
}

export default FormatTag
