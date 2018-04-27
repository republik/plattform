import React from 'react'
import {css} from 'glamor'
import { Label } from '@project-r/styleguide'

import { formatLocale } from 'd3-format'
import swissLocale from 'd3-format/locale/de-CH'

const numberFormatter = formatLocale(swissLocale).format(',')

const safeTextLength = value =>
  value &&
  value.document &&
  value.document.text &&
  value.document.text.length

const styles = {
  box: css({
    position: 'fixed',
    bottom: 0,
    left: 0,
    backgroundColor: '#fff',
    padding: '5px 10px',
    width: 'max-content',
    zIndex: '7999'
  })
}

export default ({ value }) => (
  <div {...styles.box}>
    <Label>{
      (safeTextLength(value) && numberFormatter(safeTextLength(value))) ||
      '0'
    } Zeichen</Label>
  </div>
)
