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
  Interaction,
} from '@project-r/styleguide'

const META_KEYS = [
  'title',
  'shortTitle',
  'description',
  'twitterTitle',
  'twitterDescription',
  'facebookTitle',
  'facebookDescription',
  'seoTitle',
  'seoDescription',
]

type Node = {
  type: string
  value?: string
  children: Node[]
}

const replaceSpecialChars = (term: string): string =>
  term.replace(/‧/g, '\u00AD').replace(/␣/g, '\u00a0')

const countTextReplaces =
  (searchTerm: string) =>
  (node: Node): number => {
    const searchRe = new RegExp(searchTerm, 'g')
    if (node.type === 'text') {
      return (node.value.match(searchRe) || []).length
    } else if (node.children) {
      return node.children.reduce(
        (acc, child) => acc + countTextReplaces(searchTerm)(child),
        0,
      )
    } else {
      return 0
    }
  }

const countMetaReplaces = (meta: object, searchTerm: string): number => {
  const searchRe = new RegExp(searchTerm, 'g')
  const allMetaKeys = Object.keys(meta)
  return allMetaKeys.reduce((acc, key) => {
    if (META_KEYS.includes(key) && !!meta[key]) {
      return acc + (meta[key].match(searchRe) || []).length
    } else return acc
  }, 0)
}

const replaceText =
  (searchTerm: string, replaceTerm: string) =>
  (node: Node): Node => {
    if (node.type === 'text' && node.value) {
      return {
        ...node,
        value: node.value.replaceAll(searchTerm, replaceTerm),
      }
    } else if (node.children) {
      return {
        ...node,
        children: node.children.map(replaceText(searchTerm, replaceTerm)),
      }
    } else {
      return node
    }
  }

const replaceMeta = (meta: object, searchTerm: string, replaceTerm: string) => {
  const allMetaKeys = Object.keys(meta)
  return allMetaKeys.reduce((acc, key) => {
    return {
      ...acc,
      [key]:
        META_KEYS.includes(key) && !!meta[key]
          ? meta[key].replaceAll(searchTerm, replaceTerm)
          : meta[key],
    }
  }, {})
}

const Replace: React.FC<{ value: any; onSave: (e: any) => undefined }> = ({
  value,
  onSave,
}) => {
  const [isReplacerVisible, setReplacerVisible] = useState(false)
  const [displaySearchTerm, setDisplaySearchTerm] = useState<string>('')
  const [displayReplaceTerm, setDisplayReplaceTerm] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [replaceTerm, setReplaceTerm] = useState<string>('')
  const [includeMeta, setIncludeMeta] = useState<boolean>(true)
  const [step, setStep] = useState<number>(1)
  const [countText, setCountText] = useState<number>(0)
  const [countMeta, setCountMeta] = useState<number>(0)
  const searchRef = useRef<HTMLInputElement>()
  const replaceRef = useRef<HTMLInputElement>()

  useEffect(() => {
    setSearchTerm(replaceSpecialChars(displaySearchTerm))
  }, [displaySearchTerm])

  useEffect(() => {
    setReplaceTerm(replaceSpecialChars(displayReplaceTerm))
  }, [displayReplaceTerm])

  const title = 'Suchen und Ersetzen'
  const closeReplacer = () => {
    setReplacerVisible(false)
    setDisplaySearchTerm('')
    setDisplayReplaceTerm('')
    setSearchTerm('')
    setReplaceTerm('')
    setIncludeMeta(true)
    setStep(1)
    setCountText(0)
    setCountMeta(0)
  }

  const handleCount = () => {
    setCountText(countTextReplaces(searchTerm)(value))
    if (includeMeta) {
      setCountMeta(countMetaReplaces(value.meta, searchTerm))
    }
    setStep(2)
  }

  const handleReplace = () => {
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
      setDisplaySearchTerm((prev) =>
        insertValueAtPositionInString(prev, value, pos),
      )
    } else if (document.activeElement === replaceRef.current) {
      const pos = replaceRef.current.selectionStart
      setDisplayReplaceTerm((prev) =>
        insertValueAtPositionInString(prev, value, pos),
      )
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
            <div style={{ marginBottom: 15 }}>
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
              value={displaySearchTerm}
              disabled={step === 2}
              onChange={(_, value) => setDisplaySearchTerm(value)}
            />
            <Checkbox
              checked={includeMeta}
              onChange={(_, value) => setIncludeMeta(value)}
              disabled={step === 2}
            >
              Metabereich einschliessen
            </Checkbox>
            {step === 1 && (
              <div style={{ marginTop: 30 }}>
                <Button
                  primary
                  onClick={handleCount}
                  disabled={replaceTerm === searchTerm}
                >
                  Suchen
                </Button>
              </div>
            )}
            {step === 2 && (
              <div style={{ marginTop: 15 }}>
                <div style={{ marginBottom: 15 }}>
                  <Interaction.P>
                    <b>Fliesstext:</b> {countText} Treffer
                  </Interaction.P>

                  {includeMeta && (
                    <Interaction.P>
                      <b>Metabereich:</b> {countMeta} Treffer
                    </Interaction.P>
                  )}
                </div>
                <Field
                  ref={replaceRef}
                  label='Ersetzen'
                  value={displayReplaceTerm}
                  onChange={(_, value) => setDisplayReplaceTerm(value)}
                />

                <small>
                  Diese Änderung kann nur rückgängig gemacht werden, indem du
                  alle Änderungen verwirfst. Falls du viel geändert hast, lieber
                  nochmal speichern, bevor du auf «Ersetzen» klickst.
                </small>
                <div style={{ marginTop: 15 }}>
                  <Button
                    primary
                    onClick={handleReplace}
                    style={{ marginRight: 15 }}
                  >
                    Ersetzen
                  </Button>
                  <Button onClick={() => setStep(1)}>Zurück</Button>
                </div>
              </div>
            )}
          </OverlayBody>
        </Overlay>
      )}
    </>
  )
}

export default Replace
