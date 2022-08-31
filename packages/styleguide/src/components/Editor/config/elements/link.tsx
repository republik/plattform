import {
  ElementConfigI,
  ElementFormProps,
  LinkElement,
  NormalizeFn,
} from '../../custom-types'
import { LinkIcon } from '../../../Icons'
import React, { useEffect, useRef, useState } from 'react'
import Field from '../../../Form/Field'
import { Editor, Transforms } from 'slate'
import { getFullUrl, getLinkInText } from '../../Core/helpers/text'
import renderAsText from '../../Render/text'
import { useSlate } from 'slate-react'

const isValidHttpUrl = (test: string): boolean => {
  try {
    new URL(test)
  } catch (_) {
    return false
  }
  return true
}

const Form: React.FC<ElementFormProps<LinkElement>> = ({
  element,
  path,
  onChange,
}) => {
  const [href, setHref] = useState<string>(element.href || '')
  const [text, setText] = useState<string>(renderAsText([element]))
  const editor = useSlate()
  const hrefRef = useRef<string>()
  hrefRef.current = href
  const textRef = useRef<string>()
  textRef.current = text

  useEffect(() => {
    return () => {
      onChange({ href: hrefRef.current })
      Transforms.insertText(editor, textRef.current, {
        at: path,
      })
    }
  }, [])

  return (
    <>
      <Field
        label='URL'
        type='url'
        error={
          !!href && !isValidHttpUrl(href) && 'Geben sie eine gültige URL an'
        }
        value={href}
        onChange={(_, value: string) => {
          setHref(value)
        }}
      />
      <Field
        label='Text'
        type='text'
        value={text}
        onChange={(_, value: string) => {
          setText(value)
        }}
      />
    </>
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
    stopFormIteration: true,
  },
  button: { icon: LinkIcon },
  normalizations: [unlinkWhenEmpty, checkAutolink],
  structure: [{ type: ['text'], repeat: true }],
  props: ['href'],
}
