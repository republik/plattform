import { css } from 'glamor'
import { useColorContext } from '@project-r/styleguide'

import { ZINDEX_POPOVER } from '../constants'

const HLine = ({ formatColor }) => {
  const [colorScheme] = useColorContext()
  return (
    <hr
      {...styles.hr}
      {...(formatColor
        ? colorScheme.set('backgroundColor', formatColor, 'format')
        : colorScheme.set('backgroundColor', 'divider'))}
      {...(formatColor
        ? colorScheme.set('color', formatColor, 'format')
        : colorScheme.set('color', 'divider'))}
      style={{
        height: formatColor ? 3 : 1,
      }}
    />
  )
}

export default HLine

const styles = {
  hr: css({
    margin: 0,
    display: 'block',
    border: 0,
    width: '100%',
    zIndex: ZINDEX_POPOVER + 2,
  }),
}
