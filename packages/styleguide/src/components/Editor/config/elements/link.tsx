import {
  ElementConfigI,
  ElementFormProps,
  LinkElement,
  NormalizeFn,
} from '../../custom-types'
import { LinkIcon } from '../../../Icons'
import React, { useEffect, useMemo, useRef } from 'react'
import Field from '../../../Form/Field'
import { Editor, Transforms } from 'slate'
import { useColorContext } from '../../../Colors/ColorContext'
import { css } from 'glamor'
import { link } from '../../../Typography/Editorial'

// TODO: Slate is very much not happy with forwardRef wrapped around the component
//  check that this fix wont cause problems.
export const NoRefEditoralA = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  const hoverRule = useMemo(
    () =>
      css({
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('textSoft'),
          },
        },
      }),
    [colorScheme],
  )
  return (
    <a
      {...colorScheme.set('color', 'text')}
      {...attributes}
      {...props}
      {...link}
      {...hoverRule}
    >
      {children}
    </a>
  )
}

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
  normalizations: [unlinkWhenEmpty],
  props: ['href'],
}
