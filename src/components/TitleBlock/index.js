import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  container: {
    margin: '0 0 40px 0',
    [mUp]: {
      margin: '0 0 70px 0'
    }
  }
}

const TitleBlock = ({
  children,
  attributes,
  textAlign = 'inherit',
  ...props
}) => {
  return (
    <section {...attributes} {...styles.container} style={{textAlign}}>
      {children}
    </section>
  )
}

TitleBlock.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  textAlign: PropTypes.oneOf(['inherit', 'left', 'center', 'right'])
}

export default TitleBlock
