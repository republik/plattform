import React from 'react'
import { css } from 'glamor'
import { MdInfoOutline } from 'react-icons/all'

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
      <MdInfoOutline style={{ verticalAlign: 'sub' }} /> {text}
    </small>
  </p>
)
