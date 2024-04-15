import { css } from 'glamor'

import { colors } from '@project-r/styleguide'

import LoadingBar from './LoadingBar'
import { HEADER_HEIGHT, ZINDEX_HEADER } from './constants'

const styles = {
  header: css({
    clear: 'both',
  }),
  bar: css({
    zIndex: ZINDEX_HEADER,
    position: 'fixed',
    '@media print': {
      display: 'none',
    },
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    height: HEADER_HEIGHT,
    borderBottom: `1px solid ${colors.divider}`,
    whiteSpace: 'nowrap',
    overflow: 'auto',
  }),
  left: css({
    float: 'left',
  }),
  right: css({
    float: 'right',
  }),
}

export const Section = ({ align, children }) => (
  <div {...styles[align || 'left']}>{children}</div>
)

export const Header = ({ children, barStyle, isTemplate }) => (
  <div {...styles.header}>
    <div
      {...styles.bar}
      style={{
        backgroundColor: isTemplate ? colors.secondaryBg : undefined,
        ...barStyle,
      }}
    >
      {children}
    </div>
    <LoadingBar />
  </div>
)

Header.Section = Section

export default Header
