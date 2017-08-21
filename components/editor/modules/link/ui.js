import React from 'react'
import { css } from 'glamor'
import { colors, Label } from '@project-r/styleguide'
import LinkIcon from 'react-icons/lib/fa/chain'
import Caret from 'react-icons/lib/fa/caret-right'
import HashTag from 'react-icons/lib/fa/hashtag'

import {
  createInlineButton,
  matchInline,
  createPropertyForm
} from '../../utils'

import { LINK } from './constants'
import styles from '../../styles'

export const LinkButton = createInlineButton({
  type: LINK
})(
  ({ active, disabled, ...props }) =>
    <span
      {...{...css(styles.markButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      >
      <LinkIcon />
    </span>
)

const changeHandler = (inline, state, onChange) => event => {
  onChange(
    state
      .transform()
      .setNodeByKey(inline.key, {
        data: { href: event.target.value }
      })
      .apply()
  )
}

const Form = ({ disabled, state, onChange }) => {
  if (disabled) {
    return null
  }
  return <span>
    <Label><Caret />Links</Label>
    {
      state.inlines
        .filter(matchInline(LINK))
        .map((inline, i) => (
          <span key={`link-${i}`} style={{ display: 'block' }}>
            <HashTag size={16} color={colors.disabled} />
            <input
              style={{outline: 'none', border: 'none', borderBottom: '1px solid #ccc'}}
              type='text'
              value={inline.data.get('href') || ''}
              onChange={
                changeHandler(inline, state, onChange)
              }
              />
          </span>
        ))
    }
  </span>
}

export const LinkForm = createPropertyForm({
  isDisabled: ({ state }) => {
    return !state.inlines.some(matchInline(LINK))
  }
})(Form)

export default {
  LinkButton
}
