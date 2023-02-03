import { css } from 'glamor'
import {
  mediaQueries,
  useColorContext,
  InlineSpinner,
} from '@project-r/styleguide'
import Button from './Button'
import { ReactNode, useState } from 'react'

const BottomPanel = ({
  children,
  steps,
  onClick,
}: {
  children?: ReactNode
  onClick: () => Promise<void>
  steps: ReactNode
}) => {
  const [colorScheme] = useColorContext()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleClick = async () => {
    setIsLoading(true)
    await onClick()
    setIsLoading(false)
  }

  return (
    <div {...styles.wrapper} {...colorScheme.set('backgroundColor', 'default')}>
      {steps}
      <Button onClick={handleClick} disabled={isLoading}>
        {children} {isLoading ? <InlineSpinner size={32} /> : undefined}
      </Button>
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
