import React from 'react'
import { css } from 'glamor'

import { colors, Interaction, mediaQueries } from '@project-r/styleguide'

import LoadingBar from './LoadingBar'
import { HEADER_HEIGHT, ZINDEX_HEADER } from './constants'

const styles = {
  header: css({
    clear: 'both'
  }),
  bar: css({
    zIndex: ZINDEX_HEADER,
    position: 'fixed',
    '@media print': {
      position: 'absolute'
    },
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    height: HEADER_HEIGHT,
    borderBottom: `1px solid ${colors.divider}`,
    whiteSpace: 'nowrap',
    overflow: 'auto'
  }),
  left: css({
    float: 'left'
  }),
  right: css({
    float: 'right'
  }),
  tagline: css({
    paddingTop: 18,
    paddingLeft: 4,
    [mediaQueries.mUp]: {
      paddingTop: 20,
      paddingLeft: 10
    }
  }),
  taglineP: css({
    color: colors.lightText
  })
}

export const Section = ({ align, children }) => (
  <div {...styles[align || 'left']}>{children}</div>
)

export const Tagline = ({ align, title }) => (
  <Section align={align}>
    <div {...styles.tagline}>
      <Interaction.P {...styles.taglineP}>{title}</Interaction.P>
    </div>
  </Section>
)

export const Header = ({ children, barStyle }) => (
  <div {...styles.header}>
    <div {...styles.bar} style={barStyle}>
      {children}
    </div>
    <LoadingBar />
  </div>
)

Header.Section = Section
Header.Tagline = Tagline

export default Header
