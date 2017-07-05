import * as React from 'react'
import { css, StyleAttribute } from 'glamor'
import { Column } from './Grid'

const containerStyles: StyleAttribute = css({
  height: '100vh'
})

export default ({ children }: any) =>
  <Column className={`${containerStyles}`}>
    {children}
  </Column>
