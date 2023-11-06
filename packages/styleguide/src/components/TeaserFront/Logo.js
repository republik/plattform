import React from 'react'
import { css } from 'glamor'

import SwitchImage from '../Figure/SwitchImage'
import { breakoutUp } from '../Center'
import { mUp } from './mediaQueries'
import { FigureImage } from '../Figure'

export const LOGO_SIZES = {
  small: 48,
  medium: 64,
  large: 64,
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
      marginBottom: LOGO_SIZES.medium / 4,
    },
    [breakoutUp]: {
      ...sizeLarge,
      marginBottom: LOGO_SIZES.large / 4,
    },
  }),
}

const TeaserLogo = ({ logo, logoDark, logoAlt }) => {
  const logoProps =
    logo &&
    FigureImage.utils.getResizedSrcs(logo, logoDark, LOGO_SIZES.large, false)
  if (!logoProps) {
    return null
  }
  return (
    <div style={{ display: 'inline-block' }}>
      <SwitchImage {...styles.logo} {...logoProps} alt={logoAlt} />
    </div>
  )
}

export default TeaserLogo
