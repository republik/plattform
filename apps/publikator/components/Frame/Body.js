import React from 'react'
import { HEADER_HEIGHT } from './constants'
import { NarrowContainer } from '@project-r/styleguide'

export const Body = ({ raw, children }) => (
  <div style={{ paddingTop: HEADER_HEIGHT }}>
    {raw ? (
      children
    ) : (
      <NarrowContainer>
        <div style={{ paddingTop: 40, paddingBottom: 20 }}>{children}</div>
      </NarrowContainer>
    )}
  </div>
)

export default Body
