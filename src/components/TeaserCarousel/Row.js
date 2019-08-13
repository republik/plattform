import { css } from 'glamor'
import React from 'react'

const styles = {
  carouselRow: css({
    margin: '0 -15px 0 -15px',
    padding: '0 15px 0 15px',
    width: 'auto',
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'scroll',
    flexWrap: 'nowrap',
    scrollbarWidth: 'none' /* Firefox */,
    msOverflowStyle: 'none' /* IE 10+ */,
    '&::-webkit-scrollbar': {
      width: 0,
      height: 0
    }
  })
}
export const TeaserFrontCarouselRow = ({ children }) => {
  return (
    <div role="group" {...styles.carouselRow}>
      {children}
    </div>
  )
}

export default TeaserFrontCarouselRow
