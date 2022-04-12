import { css } from 'glamor'
import { Interaction, useColorContext } from '@project-r/styleguide'

const styles = {
  box: css({
    pointerEvents: 'none',
    padding: '5px 7px',
  }),
}

const Placeholder = ({ identifier, type = 'Dynamic Component' }) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...styles.box} {...colorScheme.set('background', 'alert')}>
      {!!type && (
        <small {...colorScheme.set('color', 'textSoft')}>{type}</small>
      )}
      <Interaction.P style={{ marginBottom: 0 }}>{identifier}</Interaction.P>
    </div>
  )
}
export default Placeholder
