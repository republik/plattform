import { css } from 'glamor'
import { IconWarning } from '@republik/icons'

import { useColorContext } from '@project-r/styleguide'

const styles = {
  container: css({
    margin: '1rem 0 1rem 0',
    padding: '1rem',
  }),
}

const Info = () => {
  const [colorScheme] = useColorContext()

  return (
    <div {...styles.container} {...colorScheme.set('backgroundColor', 'alert')}>
      <IconWarning
        fill='inherit'
        size='1.2em'
        style={{
          verticalAlign: 'baseline',
          marginRight: 6,
          marginBottom: '-0.2em',
        }}
      />{' '}
      Keine sensiblen Dateien hochladen
    </div>
  )
}

export default Info
