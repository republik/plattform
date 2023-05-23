import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { FLYER_CONTAINER_MAXWIDTH } from '../Flyer'
import { Flyer } from '../Typography'

const styles = {
  outerContainer: css({
    padding: '46px 0',
    [mUp]: {
      padding: '70px 0',
    },
  }),
  innerContainer: css({
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: FLYER_CONTAINER_MAXWIDTH,
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '0 15px',
    [mUp]: {
      padding: 0,
    },
  }),
  link: css({
    marginTop: 27,
    [mUp]: {
      marginTop: 36,
    },
  }),
}

const SeparatorGutenTag = () => {
  return (
    <div {...styles.outerContainer}>
      <div {...styles.innerContainer}>
        <Flyer.H1>
          Guten Tag.
          <br />
          Schön, sind Sie da!
        </Flyer.H1>
      </div>
    </div>
  )
}

export default SeparatorGutenTag
