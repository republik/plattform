import { css } from 'glamor'
import { mediaQueries, useColorContext } from '@project-r/styleguide'
import Button from './Button'
import { ReactNode } from 'react'

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
    position: 'fixed',
    bottom: 0,
    margin: '0 -15px',
    padding: '0px 15px 15px 15px',
    width: '100vw',
    [mediaQueries.mUp]: {
      position: 'relative',
      margin: 0,
      width: '100%',
      padding: '15px 15px 15px 15px',
    },
  }),
}
