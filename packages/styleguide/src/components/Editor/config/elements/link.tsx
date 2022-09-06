import {
  ElementConfigI,
  ElementFormProps,
  LinkElement,
  NormalizeFn,
} from '../../custom-types'
import { LinkIcon } from '../../../Icons'
import React from 'react'
import Field from '../../../Form/Field'
import { Editor, Transforms } from 'slate'
import {
  getFullUrl,
  getLinkInText,
  isValidHttpUrl,
} from '../../Core/helpers/text'
import RepoSearch from '../../Forms/RepoSearch'
import AuthorSearch from '../../Forms/AuthorSearch'
import { formStyles } from '../../Forms/layout'
import { useRenderContext } from '../../Render/Context'

const Form: React.FC<ElementFormProps<LinkElement>> = ({
  element,
  onChange,
}) => {
  const { t } = useRenderContext()
  const href = element.href || ''

  return (
    <>
      <div {...formStyles.section}>
        <Field
          label='URL'
          type='url'
          error={
            !!href && !isValidHttpUrl(href) && t('editor/form/link/urlError')
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
      </div>
      <div {...formStyles.section}>
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
