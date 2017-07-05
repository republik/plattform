import * as React from 'react'
import { css, StyleAttribute } from 'glamor'
import { Row } from './Grid'

const headerStyles: StyleAttribute = css({
  width: '100%'
})

export default ({ children }: any) =>
  <Row
    justifyContent="center"
    className={`${headerStyles}`}
  >
    {children}
  </Row>
