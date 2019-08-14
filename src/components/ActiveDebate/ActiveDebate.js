import { css } from 'glamor'
import React from 'react'
import PropTypes from 'prop-types'

const styles = css({
  margin: 0,
  padding: '30px 15px',
  overflow: 'auto',
  backgroundColor: '#FFFFFF',
  color: '#000000'
})

const ActiveDebate = ({ children, hasHighlight = false }) => (
  <div role="group" {...styles}>
    {/* One or two columns based on hasHighlight */}
    {children}
  </div>
)

export default ActiveDebate

ActiveDebate.propTypes = {
  hasHighlight: PropTypes.bool,
  children: PropTypes.node.isRequired
}
