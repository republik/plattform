import { css } from 'glamor'

import { useColorContext } from '@project-r/styleguide'

const styles = {
  box: css({
    paddingTop: 30,
    paddingBottom: 30,
  }),
}

const Box = ({ children, style }) => {
  const [colorScheme] = useColorContext()

  return (
    <div
      {...styles.box}
      {...colorScheme.set('backgroundColor', 'alert')}
      {...colorScheme.set('color', 'text')}
      style={style}
    >
      {children}
    </div>
  )
}

export default Box
