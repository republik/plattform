import React from 'react'
import { css } from 'glamor'
import { Interaction, colors } from '@project-r/styleguide'

const styles = {
  box: css({
    background: colors.primaryBg,
    pointerEvents: 'none',
    padding: '5px 7px'
  })
}

const Placeholder = identifier => () => {
  return (
    <div {...styles.box}>
      <small>Dynamic Component</small>
      <br />
      <Interaction.P style={{ marginBottom: 0 }}>{identifier}</Interaction.P>
    </div>
  )
}
export default Placeholder
