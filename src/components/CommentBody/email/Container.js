import React from 'react'
import { cssFor } from 'glamor'

import { serifRegular16 } from '../../Typography/styles'
import { Editorial } from '../../Typography'

const styles = {
  container: {
    ...serifRegular16
  }
}

export default ({ children }) => (
  <div style={styles.container} className={Editorial.fontRule}>
    <style
      type='text/css'
      dangerouslySetInnerHTML={{
        __html: `
      ${cssFor(Editorial.fontRule)}
    `
      }}
    />
    {children}
  </div>
)
