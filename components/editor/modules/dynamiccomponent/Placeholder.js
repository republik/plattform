import React from 'react'
import { css } from 'glamor'
import { Interaction, useColorContext } from '@project-r/styleguide'

const styles = {
  box: css({
    pointerEvents: 'none',
    padding: '5px 7px'
  })
}

const Placeholder = ({ identifier }) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...styles.box} {...colorScheme.set('background', 'alert')}>
      <small {...colorScheme.set('color', 'textSoft')}>Dynamic Component</small>
      <br />
      <Interaction.P style={{ marginBottom: 0 }}>{identifier}</Interaction.P>
    </div>
  )
}
export default Placeholder
