import React from 'react'
import { Label } from '@project-r/styleguide'
import LinkIcon from 'react-icons/lib/fa/chain'
import { Map } from 'immutable'

import {
  createInlineButton,
  matchInline,
  createPropertyForm,
  buttonStyles
} from '../../utils'

import MetaForm from '../../utils/MetaForm'

export default ({TYPE}) => {
  const LinkButton = createInlineButton({
    type: TYPE
  })(
    ({ active, disabled, visible, ...props }) =>
      <span
        {...buttonStyles.mark}
        {...props}
        data-active={active}
        data-disabled={disabled}
        data-visible={visible}
        >
        <LinkIcon />
      </span>
  )

  const Form = ({ disabled, value, onChange }) => {
    if (disabled) {
      return null
    }
    return <div>
      <Label>Links</Label>
      {
        value.inlines
          .filter(matchInline(TYPE))
          .map((node, i) => {
            const onInputChange = key => (_, inputValue) => {
              onChange(
                value
                  .change()
                  .setNodeByKey(node.key, {
                    data: inputValue
                      ? node.data.set(key, inputValue)
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
    isDisabled: ({ value }) => {
      return !value.inlines.some(matchInline(TYPE))
    }
  })(Form)

  return {
    forms: [LinkForm],
    textFormatButtons: [LinkButton]
  }
}
