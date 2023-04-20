import React, { ReactNode } from 'react'
import { css } from 'glamor'

import { mediaQueries, FlyerTile } from '@project-r/styleguide'

const styles = {
  footer: css({
    marginTop: -35,
    [mediaQueries.mUp]: {
      marginTop: -60,
    },
  }),
}

const FlyerFooter: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <FlyerTile {...styles.footer} innerStyle={{ paddingTop: 0 }}>
      {children}
    </FlyerTile>
  )
}

export default FlyerFooter
