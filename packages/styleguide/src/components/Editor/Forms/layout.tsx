import React from 'react'
import { css } from 'glamor'
import { IconInfoOutline } from '@republik/icons'

export const formStyles = {
  section: css({ ':not(:first-child)': { marginTop: 64 } }),
  sectionTitle: css({ margin: '24px 0' }),
  hint: css({
    margin: '-10px 0 10px',
  }),
}

export const Hint = ({ text }) => (
  <p {...formStyles.hint}>
    <small>
      <IconInfoOutline style={{ verticalAlign: 'sub' }} /> {text}
    </small>
  </p>
)
