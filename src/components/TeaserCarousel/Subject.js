import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import colors from '../../theme/colors'

const styles = css({
  color: colors.lightText
})

const Subject = ({ children }) => {
  return <span {...styles}>{children} &nbsp;</span>
}

Subject.propTypes = {
  children: PropTypes.node
}

export default Subject
