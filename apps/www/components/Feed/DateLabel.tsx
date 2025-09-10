import { css } from 'glamor'
import { mediaQueries, useColorContext } from '@project-r/styleguide'


const SIDEBAR_WIDTH = 120
const MARGIN_WIDTH = 20

const DateLabel = ({ children, label }) => {
  const [colorScheme] = useColorContext()

  return (
    <section>
      <div
        {...style.header}
        {...colorScheme.set('borderBottomColor', 'divider')}
      >
        {label}
      </div>
      {children}
    </section>
  )
}

const style = {
  header: css({
    margin: '0 0 30px 0',
    borderTopWidth: 1,
    width: '100%',
    padding: '8px 0',
    [mediaQueries.lUp]: {
      height: 'auto',
      float: 'left',
      margin: `0 0 30px -${SIDEBAR_WIDTH + MARGIN_WIDTH}px`,
      width: SIDEBAR_WIDTH,
      '& > div': {
        width: SIDEBAR_WIDTH,
      },
    },
  }),
}

export default DateLabel
