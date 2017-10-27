import React from 'react'
import { css } from 'glamor'
import { Label } from '@project-r/styleguide'
import LinkIcon from 'react-icons/lib/fa/chain'
import { Map } from 'immutable'

import {
  createInlineButton,
  matchInline,
  createPropertyForm
} from '../../utils'

import MetaForm from '../../utils/MetaForm'

import styles from '../../styles'

export default ({TYPE}) => {
  const LinkButton = createInlineButton({
    type: TYPE
  })(
    ({ active, disabled, visible, ...props }) =>
      <span
        {...{...css(styles.markButton), ...props}}
        data-active={active}
        data-disabled={disabled}
        data-visible={visible}
        >
        <LinkIcon />
      </span>
  )

  const Form = ({ disabled, state, onChange }) => {
    if (disabled) {
      return null
    }
    return <div>
      <Label>Links</Label>
      {
        state.inlines
          .filter(matchInline(TYPE))
          .map((node, i) => {
            const onInputChange = key => (_, value) => {
              onChange(
                state
                  .change()
                  .setNodeByKey(node.key, {
                    data: value
                      ? node.data.set(key, value)
                      : node.data.remove(key)
                  })
              )
            }
            return (
              <MetaForm
                key={`link-${i}`}
                data={Map({
                  href: '',
                  title: ''
                }).merge(node.data)}
                onInputChange={onInputChange}
              />
            )
          })
      }
    </div>
  }

  const LinkForm = createPropertyForm({
    isDisabled: ({ state }) => {
      return !state.inlines.some(matchInline(TYPE))
    }
  })(Form)

  return {
    forms: [LinkForm],
    textFormatButtons: [LinkButton]
  }
}
