import { css } from 'glamor'
import { Logo, mediaQueries } from '@project-r/styleguide'

import SectionContainer from './Common/SectionContainer'

const LogoSection = () => {
  return (
    <SectionContainer>
      <div {...styles.logoContainer}>
        <div {...styles.logo}>
          <Logo />
        </div>
      </div>
    </SectionContainer>
  )
}

const styles = {
  logoContainer: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '8em 0',
  }),
  logo: css({
    width: 290,
    [mediaQueries.mUp]: {
      width: 350,
    },
  }),
}

export default LogoSection
