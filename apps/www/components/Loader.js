import React from 'react'
import { HEADER_HEIGHT } from './constants'
import { Loader, NarrowContainer } from '@project-r/styleguide'

const PageLoader = (props) => (
  <Loader
    ErrorContainer={NarrowContainer}
    {...props}
    style={{ minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`, ...props.style }}
  />
)

export default PageLoader
