import { css } from 'glamor'
import React, { useEffect, useRef, useState } from 'react'
import {
  Overlay,
  OverlayToolbar,
  OverlayBody,
  Field,
  Button,
  Checkbox,
  plainButtonRule,
  colors,
} from '@project-r/styleguide'

const styles = {
  inline: css({
    pointerEvents: 'none',
    opacity: 0.333,
    ':empty::before': {
      content: 'attr(data-text)',
    },
  }),
}

type Node = {
  type: string
  value?: string
  children: Node[]
}

const replaceText =
  (searchTerm: string, replaceTerm: string) =>
  (node: Node): Node => {
    const replaceTermHyphens = replaceTerm
      .replace(/‧/g, '\u00AD')
      .replace(/␣/g, '\u00a0')

    const searchTermHyphens = searchTerm
      .replace(/‧/g, '\u00AD')
      .replace(/␣/g, '\u00a0')

    if (node.type === 'text') {
      return {
        ...node,
        value: node.value.replaceAll(searchTermHyphens, replaceTermHyphens),
      }
    } else if (node.children) {
      return {
        ...node,
        children: node.children.map(
          replaceText(searchTermHyphens, replaceTermHyphens),
        ),
      }
    } else {
      return node
    }
  }

const replaceMeta = (meta: object, searchTerm: string, replaceTerm: string) => {
  const allMetaKeys = Object.keys(meta)
  const metaReplacement = allMetaKeys.reduce((next, key) => {
    return {
      ...next,
      [key]: metaKeys.includes(key)
        ? meta[key].replaceAll(searchTerm, replaceTerm)
        : meta[key],
    }
  }, {})
  return metaReplacement
}

// todo: add more searchable fields
const metaKeys = ['description']

const Replace: React.FC<{ value: any; onSave: (e: any) => undefined }> = ({
  value,
  onSave,
}) => {
  const [isReplacerVisible, setReplacerVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [replaceTerm, setReplaceTerm] = useState<string>('')
  const [includeMeta, setIncludeMeta] = useState<boolean>()
  const searchRef = useRef<HTMLInputElement>()
  const replaceRef = useRef<HTMLInputElement>()

  const title = 'Suchen und ersetzen'
  const closeReplacer = () => setReplacerVisible(false)

  // TODO: global replace
  const replace = () => {
    const newValue = {
      ...value,
      children: value.children.map(replaceText(searchTerm, replaceTerm)),
      meta: includeMeta
        ? replaceMeta(value.meta, searchTerm, replaceTerm)
        : value.meta,
    }
    onSave(newValue)
    closeReplacer()
  }

  const insertValueAtPositionInString = (
    text: string,
    value: string,
    position: number,
  ) => {
    return [text.slice(0, position), value, text.slice(position)].join('')
  }

  /**
   * Append special character to search or replace term.
   * The handler must be set on a buttons onMouseDown event
   * (using onClick would loose the input focus before appending the character)
   * @param value
   */
  const handleClickSpecialCharacter = (value: string) => {
    if (document.activeElement === searchRef.current) {
      const pos = searchRef.current.selectionStart
      setSearchTerm((prev) => insertValueAtPositionInString(prev, value, pos))
    } else if (document.activeElement === replaceRef.current) {
      const pos = replaceRef.current.selectionStart
      setReplaceTerm((prev) => insertValueAtPositionInString(prev, value, pos))
    }
  }

  return (
    <>
      <button
        {...plainButtonRule}
        style={{ color: colors.primary, marginTop: 10 }}
        onClick={() => setReplacerVisible(true)}
      >
        {title}
      </button>
      {isReplacerVisible && (
        <Overlay
          onClose={closeReplacer}
          mUpStyle={{ maxWidth: 400, minHeight: 0 }}
        >
          <OverlayToolbar title={title} onClose={closeReplacer} />
          <OverlayBody>
            <div>
              <button
                {...plainButtonRule}
                style={{ paddingRight: 20 }}
                onMouseDown={() => handleClickSpecialCharacter('␣')}
              >
                Dauerleerzeichen (
                <span style={{ color: 'rgb(30, 144, 255)' }}>␣</span>)
              </button>
              <button
                {...plainButtonRule}
                onMouseDown={() => handleClickSpecialCharacter('‧')}
              >
                Weiches Trennzeichen (
                <span style={{ color: 'rgb(30, 144, 255)' }}>‧</span>)
              </button>
            </div>
            <Field
              ref={searchRef}
              label='Suchen'
              value={searchTerm}
              onChange={(_, value) => setSearchTerm(value)}
            />
            <Field
              ref={replaceRef}
              label='Ersetzen'
              value={replaceTerm}
              onChange={(_, value) => setReplaceTerm(value)}
            />
            <Checkbox
              checked={includeMeta}
              onChange={(_, value) => setIncludeMeta(value)}
            >
              Metabereich einschliessen
            </Checkbox>
            <div style={{ textAlign: 'center', marginTop: 15 }}>
              <Button primary onClick={replace}>
                Ersetzen
              </Button>
            </div>
          </OverlayBody>
        </Overlay>
      )}
    </>
  )
}

export default Replace
