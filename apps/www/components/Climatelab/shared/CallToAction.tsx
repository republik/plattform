import { css } from 'glamor'
import { FC, ReactNode } from 'react'
import { fontStyles, useColorContext } from '@project-r/styleguide'

const CallToAction: FC<{ children?: ReactNode }> = ({ children }) => {
  const [colorScheme] = useColorContext()

  return (
    <div
      {...styles.wrapper}
      {...colorScheme.set('color', 'climateButtonText')}
      {...colorScheme.set('backgroundColor', 'primary')}
    >
      <p {...styles.text}>{children}</p>
    </div>
  )
}

export default CallToAction

const styles = {
  wrapper: css({
    display: 'inline-block',
  }),
  text: css({
    ...fontStyles.serifBold32,
    margin: 0,
    boxSizing: 'border-box',
    padding: '0.25rem 0.5rem',
    width: 'fit-content',
  }),
}
