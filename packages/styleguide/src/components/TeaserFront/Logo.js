import React from 'react'
import { css } from 'glamor'

import SwitchImage from '../Figure/SwitchImage'
import { breakoutUp } from '../Center'
import { mUp } from './mediaQueries'
import { FigureImage } from '../Figure'

export const LOGO_SIZES = {
  small: 24,
  medium: 36,
  large: 52,
}

const sizeSmall = {
  maxHeight: `${LOGO_SIZES.small}px`,
  maxWidth: `${LOGO_SIZES.small}px`,
}

const sizeMedium = {
  maxHeight: `${LOGO_SIZES.medium}px`,
  maxWidth: `${LOGO_SIZES.medium}px`,
}

const sizeLarge = {
  maxHeight: `${LOGO_SIZES.large}px`,
  maxWidth: `${LOGO_SIZES.large}px`,
}

const styles = {
  logo: css({
    marginBottom: LOGO_SIZES.small / 4,
    minWidth: 24,
    ...sizeSmall,
    [mUp]: {
      ...sizeMedium,
      marginBottom: LOGO_SIZES.small / 4,
    },
    [breakoutUp]: {
      ...sizeLarge,
      marginBottom: LOGO_SIZES.small / 4,
    },
  }),
}

const TeaserLogo = ({ logo, logoDark, logoAlt }) => {
  const logoProps =
    logo && FigureImage.utils.getResizedSrcs(logo, LOGO_SIZES.large, false)
  const logoDarkProps =
    logoDark &&
    FigureImage.utils.getResizedSrcs(logoDark, LOGO_SIZES.large, false)
  if (!logoProps) {
    return null
  }
  return (
    <div style={{ display: 'inline-block' }}>
      <SwitchImage
        {...styles.logo}
        src={logoProps.src}
        srcSet={logoProps.srcSet}
        dark={logoDarkProps}
        alt={logoAlt}
      />
    </div>
  )
}

export default TeaserLogo
