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
import RepoSearch from '../../Forms/RepoSearch'
import AuthorSearch from '../../Forms/AuthorSearch'
import { formStyles } from '../../Forms/layout'
import { useRenderContext } from '../../Render/Context'
import { AutoSlugLinkInfo } from '../../Forms/github'

const Form: React.FC<ElementFormProps<LinkElement>> = ({
  element,
  onChange,
}) => {
  const { t } = useRenderContext()
  const [href, setHref] = useState(element.href || '')
  const [title, setTitle] = useState(element.title || '')
  const hrefRef = useRef<string>()
  const titleRef = useRef<string>()
  hrefRef.current = href
  titleRef.current = title

  useEffect(() => {
    return () => {
      onChange({
        href: hrefRef.current,
        title: titleRef.current,
      })
    }
  }, [])

  return (
    <>
      <div {...formStyles.section}>
        <Field
          label='URL'
          type='url'
          value={href}
          onChange={(_, value: string) => {
            setHref(value)
          }}
        />
        <AutoSlugLinkInfo
          value={href}
          label={t('metaData/field/href/document')}
        />
        <Field
          label='Title'
          value={title}
          onChange={(_, value: string) => {
            setTitle(value)
          }}
        />
      </div>
      <div {...formStyles.section}>
        <RepoSearch
          onChange={({ value, text }) => {
            const githubHref = `https://github.com/${value.id}?autoSlug`
            setHref(githubHref)
            setTitle(text)
          }}
        />
        <AuthorSearch
          onChange={({ value }) => {
            setHref(`/~${value.id}`)
            setTitle(value.name)
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
    // TODO: inlines inherit formatText from parent block
    formatText: true,
    stopFormIteration: true,
  },
  button: { icon: LinkIcon },
  normalizations: [unlinkWhenEmpty, checkAutolink],
  structure: [{ type: ['text', 'memo'], repeat: true }],
  props: ['href', 'title'],
}
