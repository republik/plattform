import {
  ElementConfigI,
  ElementFormProps,
  LinkElement,
  NormalizeFn,
} from '../../custom-types'
import { LinkIcon } from '../../../Icons'
import React, { useMemo, useState } from 'react'
import Field from '../../../Form/Field'
import { Editor, Transforms } from 'slate'
import { useColorContext } from '../../../Colors/ColorContext'
import { css } from 'glamor'
import { link } from '../../../Typography/Editorial'
import { getFullUrl, getLinkInText } from '../../components/editor/helpers/text'

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

export const NoRefA = ({ children, attributes, ...props }) => (
  <a {...attributes} {...props} {...link}>
    {children}
  </a>
)

const Form: React.FC<ElementFormProps<LinkElement>> = ({
  element,
  onChange,
  onClose,
}) => {
  const [href, setHref] = useState<string>(element.href || '')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onChange({ href })
        onClose()
      }}
    >
      <Field
        autoFocus='autofocus'
        label='URL'
        type='url'
        value={href}
        onChange={(_, value: string) => setHref(value)}
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

const checkAutolink: NormalizeFn<LinkElement> = ([node, path], editor) => {
  const linkInText = getLinkInText(Editor.string(editor, path))
  // if there is no link in text, this is not an autolink
  if (!linkInText) return false
  const expectedHref = getFullUrl(linkInText)
  if (expectedHref === node.href) return false
  Transforms.setNodes(editor, { href: expectedHref }, { at: path })
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
  normalizations: [unlinkWhenEmpty, checkAutolink],
  props: ['href'],
}
