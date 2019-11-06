import React from 'react'
import { HEADER_HEIGHT } from './Frame/constants'
import { NarrowContainer, Loader } from '@project-r/styleguide'

const ErrorContainer = ({ children }) => (
  <NarrowContainer>
    <br />
    <br />
    {children}
  </NarrowContainer>
)

const LoaderWithHeaderHeight = props => (
  <Loader
    ErrorContainer={ErrorContainer}
    {...props}
    height={['100vh', `calc(100vh - ${HEADER_HEIGHT}px)`]}
  />
)

export default LoaderWithHeaderHeight
