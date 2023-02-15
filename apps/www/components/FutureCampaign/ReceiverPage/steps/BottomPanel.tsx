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
  onClick: () => void | Promise<void>
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
    position: 'sticky',
    bottom: 0,
    paddingBottom: 15,
    width: '100%',
  }),
}
