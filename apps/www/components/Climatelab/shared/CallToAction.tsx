import { css } from 'glamor'
import { FC } from 'react'
import { fontStyles } from '@project-r/styleguide'
import { ClimatelabColors } from '../ClimatelabColors'

const CallToAction: FC = ({ children }) => {
  return (
    <div {...styles.wrapper}>
      <p {...styles.text}>{children}</p>
    </div>
  )
}

export default CallToAction

const styles = {
  wrapper: css({}),
  text: css({
    ...fontStyles.serifBold32,
    margin: 0,
    backgroundColor: ClimatelabColors.accent,
    color: ClimatelabColors.accentText,
    padding: '0.5rem 1rem',
    width: 'fit-content',
  }),
}
