import { useState } from 'react'
import { css } from 'glamor'

import { Container, mediaQueries } from '@project-r/styleguide'

import Sidebar, { minWindowHeight } from './Sidebar'
import { CONTENT_PADDING, SIDEBAR_WIDTH } from './constants'

const mUp = `@media only screen and (min-width: ${mediaQueries.mBreakPoint}px) and (min-height: ${minWindowHeight}px)`
const lUp = `@media only screen and (min-width: ${mediaQueries.lBreakPoint}px) and (min-height: ${minWindowHeight}px)`

const styles = {
  sidebar: css({
    paddingTop: 25,
    [mUp]: {
      float: 'right',
      width: SIDEBAR_WIDTH,
    },
  }),
  content: css({
    paddingTop: 20,
    [mUp]: {
      paddingLeft: CONTENT_PADDING,
      paddingRight: CONTENT_PADDING + SIDEBAR_WIDTH,
    },
    [lUp]: {
      paddingRight: CONTENT_PADDING * 2 + SIDEBAR_WIDTH,
    },
  }),
}

export const Content = ({ children }) => (
  <div {...styles.content}>{children}</div>
)

const ContainerWithSidebar = ({ sidebarProps, children }) => {
  const [sticky, setSticky] = useState({})

  return (
    <Container>
      <div {...styles.sidebar}>
        <Sidebar {...sidebarProps} sticky={sticky} setSticky={setSticky} />
      </div>
      <Content>{children}</Content>
    </Container>
  )
}

export default ContainerWithSidebar
