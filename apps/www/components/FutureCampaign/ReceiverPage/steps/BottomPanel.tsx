import { css } from 'glamor'
import { Button, mediaQueries, useColorContext } from '@project-r/styleguide'

const BottomPanel = ({
  children,
  steps,
  onAdvance,
}: {
  children?: ReactNode
  onAdvance: () => void
  steps: ReactNode
}) => {
  const [colorScheme] = useColorContext()

  return (
    <div {...styles.wrapper} {...colorScheme.set('backgroundColor', 'default')}>
      {steps}
      <Button onClick={() => onAdvance()}>{children}</Button>
    </div>
  )
}

export default BottomPanel

const styles = {
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    bottom: 0,
    margin: '0 -15px',
    padding: '0px 15px 15px 15px',
    width: '100vw',
    [mediaQueries.mUp]: {
      position: 'relative',
      margin: 0,
      padding: 0,
      width: '100%',
    },
  }),
}
