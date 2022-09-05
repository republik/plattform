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
import {
  getFullUrl,
  getLinkInText,
  isValidHttpUrl,
} from '../../Core/helpers/text'
import renderAsText from '../../Render/text'
import { useSlate } from 'slate-react'
import RepoSearch from '../../Forms/RepoSearch'
import AuthorSearch from '../../Forms/AuthorSearch'
import { formStyles, Hint } from '../../Forms/layout'

const Form: React.FC<ElementFormProps<LinkElement>> = ({
  element,
  path,
  onChange,
}) => {
  const href = element.href || ''
  const initText = renderAsText([element])
  const [text, setText] = useState<string>(initText)
  const editor = useSlate()
  const textRef = useRef<string>()
  textRef.current = text

  const updateSlate = () => {
    if (textRef.current !== initText) {
      Transforms.insertText(editor, textRef.current, {
        at: path,
      })
    }
  }

  // Directly updating the link props causes issues
  // with the normalizer and the cursor.
  useEffect(() => {
    return updateSlate
  }, [])

  return (
    <>
      <div {...formStyles.section}>
        <Field
          label='URL'
          type='url'
          error={
            !!href && !isValidHttpUrl(href) && 'Geben sie eine gültige URL an'
          }
          value={href}
          onChange={(_, value: string) => {
            onChange({
              href: value,
            })
          }}
        />
        <Field
          label='Title'
          value={element.title || ''}
          onChange={(_, value: string) => {
            onChange({
              title: value,
            })
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
        <Hint text='Link Text editieren wird die lokale Formatierung löschen.' />
      </div>
      <div {...formStyles.section}>
        <h3 {...formStyles.sectionTitle}>Suchen und ausfüllen</h3>
        <RepoSearch
          onChange={({ value, text }) => {
            const href = `https://github.com/${value.id}?autoSlug`
            onChange({
              href,
              title: text,
            })
          }}
        />
        <AuthorSearch
          onChange={({ value }) => {
            onChange({
              href: `/~${value.id}`,
              title: value.name,
            })
            setText(value.name)
          }}
        />
      </div>
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
  props: ['href', 'title'],
}
