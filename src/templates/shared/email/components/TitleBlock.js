import React from 'react'
import { Editorial, TitleBlock as ETitleBlock } from '../../../../lib'

// TODO: make email safe
export const TitleBlock = ({ children, center }) => {
  return <ETitleBlock center={center}>{children}</ETitleBlock>
}

// TODO: make email safe
export const Headline = ({ children }) => (
  <Editorial.Headline>{children}</Editorial.Headline>
)

// TODO: make email safe
export const Subject = ({ children }) => <Editorial.P>{children}</Editorial.P>

// TODO: make email safe
export const Lead = ({ children }) => (
  <Editorial.Lead>{children}</Editorial.Lead>
)

// TODO: make email safe
export const Credits = ({ children }) => (
  <Editorial.Credit>{children}</Editorial.Credit>
)
