import * as React from 'react'
import { css, StyleAttribute } from 'glamor'

const bodyStyles: StyleAttribute = css({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  overflow: 'auto',
  flex: '1 1 auto'
})

export default ({ children }: any) =>
  <div className={`${bodyStyles}`}>
    {children}
  </div>
