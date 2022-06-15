import {
  ElementConfigI,
  ElementFormProps,
  LinkElement,
  NormalizeFn,
} from '../../custom-types'
import { LinkIcon } from '../../../Icons'
import React, { useEffect, useRef } from 'react'
import Field from '../../../Form/Field'
import { Editor, Transforms } from 'slate'

const Form: React.FC<ElementFormProps<LinkElement>> = ({
  element,
  onChange,
  onClose,
}) => {
  const ref = useRef(null)

  // TODO: make autofocus work
  useEffect(() => {
    if (ref?.current) {
      ref.current.focus()
    }
  }, [ref])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onClose()
      }}
    >
      <Field
        ref={ref}
        label='URL'
        value={element.href}
        onChange={(_, href: string) => onChange({ href })}
      />
    </form>
  )
}

const unlinkWhenEmpty: NormalizeFn<LinkElement> = ([node, path], editor) => {
  if (Editor.string(editor, path) === '') {
    Transforms.unwrapNodes(editor, { at: path })
    return true
  }
  return false
}

export const config: ElementConfigI = {
  Form,
  attrs: {
    isInline: true,
    isTextInline: true,
    formatText: true,
  },
  button: { icon: LinkIcon },
  component: 'link',
  defaultProps: {
    href: 'https://',
  },
  normalizations: [unlinkWhenEmpty],
  props: ['href'],
}
