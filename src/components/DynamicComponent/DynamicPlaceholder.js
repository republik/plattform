import React from 'react'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { Interaction } from '../Typography'

const styles = {
  box: css({
    background: colors.primaryBg,
    pointerEvents: 'none',
    padding: '5px 7px'
  })
}

const DynamicPlaceholder = identifier => () => {
  return (
    <div {...styles.box}>
      <small>Dynamic Component</small>
      <br />
      <Interaction.P style={{ marginBottom: 0 }}>{identifier}</Interaction.P>
    </div>
  )
}
export default DynamicPlaceholder
