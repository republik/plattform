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
import { escapeRegExp } from 'lodash'

import { useTranslation } from '../../lib/withT'

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
  identifier?: string
  value?: string
  children: Node[]
}

const replaceSpecialChars = (term: string): string =>
  term.replace(/‧/g, '\u00AD').replace(/␣/g, '\u00a0')

const countTextReplaces =
  (searchTerm: string) =>
  (node: Node): number => {
    const searchRe = new RegExp(escapeRegExp(searchTerm), 'g')
    if (node.type === 'text') {
      return (node.value.match(searchRe) || []).length
      // exclude byline (aka last paragraph of title node)
    } else if (node.children && node.identifier === 'TITLE') {
      return node.children.reduce(
        (acc, child, idx) =>
          idx === 3 && child.type === 'paragraph'
            ? acc
            : acc + countTextReplaces(searchTerm)(child),
        0,
      )
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
  const searchRe = new RegExp(escapeRegExp(searchTerm), 'g')
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
      // exclude byline (aka last paragraph of title node)
    } else if (node.children && node.identifier === 'TITLE') {
      return {
        ...node,
        children: node.children.map((child, idx) =>
          idx === 3 && child.type === 'paragraph'
            ? child
            : replaceText(searchTerm, replaceTerm)(child),
        ),
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
  const { t } = useTranslation()
  const [isReplacerVisible, setReplacerVisible] = useState(false)
  const [displaySearchTerm, setDisplaySearchTerm] = useState<string>('')
  const [displayReplaceTerm, setDisplayReplaceTerm] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [replaceTerm, setReplaceTerm] = useState<string>('')
  const [includeMeta, setIncludeMeta] = useState<boolean>(false)
  const [step, setStep] = useState<number>(1)
  const [countText, setCountText] = useState<number>(0)
  const [countMeta, setCountMeta] = useState<number>(0)
  const [searched, setSearched] = useState<boolean>(false)
  const searchRef = useRef<HTMLInputElement>()
  const replaceRef = useRef<HTMLInputElement>()

  useEffect(() => {
    setSearchTerm(replaceSpecialChars(displaySearchTerm))
  }, [displaySearchTerm])

  useEffect(() => {
    setReplaceTerm(replaceSpecialChars(displayReplaceTerm))
  }, [displayReplaceTerm])

  const title = t('editor/replace/title')
  const closeReplacer = () => {
    setReplacerVisible(false)
    setDisplaySearchTerm('')
    setDisplayReplaceTerm('')
    setSearchTerm('')
    setReplaceTerm('')
    setIncludeMeta(false)
    setStep(1)
    setCountText(0)
    setCountMeta(0)
    setSearched(false)
  }

  const canSubmit =
    (step === 1 && searchTerm !== '') || (step === 2 && replaceTerm !== '')

  const handleCount = () => {
    if (!canSubmit) {
      return
    }
    const textReplacesCount = countTextReplaces(searchTerm)(value)
    const metaReplacesCount = includeMeta
      ? countMetaReplaces(value.meta, searchTerm)
      : 0

    setSearched(true)

    if (textReplacesCount + metaReplacesCount > 0) {
      setCountText(textReplacesCount)
      setCountMeta(metaReplacesCount)
      setStep(2)
    }
  }

  const handleReplace = () => {
    if (!canSubmit) {
      return
    }
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

  const handleBack = () => {
    setCountText(0)
    setCountMeta(0)
    setSearched(false)
    setStep(1)
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

  useEffect(() => {
    if (isReplacerVisible && step === 1) {
      searchRef.current?.focus()
    } else if (isReplacerVisible && step === 2) {
      replaceRef.current?.focus()
    }
  }, [step, isReplacerVisible])

  return (
    <>
      <button
        {...plainButtonRule}
        style={{ color: colors.primary, marginTop: 10, display: 'block' }}
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
            <form
              onSubmit={(e) => {
                if (step === 1) {
                  handleCount()
                } else if (step === 2) {
                  handleReplace()
                }
                e.preventDefault()
              }}
            >
              <div style={{ marginBottom: 15 }}>
                <button
                  {...plainButtonRule}
                  style={{ paddingRight: 20 }}
                  onMouseDown={() => handleClickSpecialCharacter('␣')}
                >
                  {t('editor/specialChar/nbsp')} (
                  <span style={{ color: 'rgb(30, 144, 255)' }}>␣</span>)
                </button>
                <button
                  {...plainButtonRule}
                  onMouseDown={() => handleClickSpecialCharacter('‧')}
                >
                  {t('editor/specialChar/shy')} (
                  <span style={{ color: 'rgb(30, 144, 255)' }}>‧</span>)
                </button>
              </div>
              <Field
                ref={searchRef}
                label='Suchen'
                value={displaySearchTerm}
                disabled={step === 2}
                onChange={(_, value) => setDisplaySearchTerm(value as string)}
              />
              <Checkbox
                checked={includeMeta}
                onChange={(_, value) => setIncludeMeta(value)}
                disabled={step === 2}
              >
                {t('editor/replace/includeMeta')}
              </Checkbox>

              <div style={{ marginTop: 15 }}>
                {step === 2 && (
                  <>
                    <Interaction.P>
                      <b>{t('editor/replace/text')}</b>{' '}
                      {t.elements('editor/replace/foundOccurences', {
                        count: countText.toFixed(0),
                      })}
                    </Interaction.P>

                    {includeMeta && (
                      <Interaction.P>
                        <b>{t('editor/replace/meta')}</b>{' '}
                        {t.elements('editor/replace/foundOccurences', {
                          count: countMeta.toFixed(0),
                        })}
                      </Interaction.P>
                    )}
                  </>
                )}

                {searched && countText + countMeta === 0 && (
                  <Interaction.P>
                    {t('editor/replace/nothingFound')}
                  </Interaction.P>
                )}
              </div>

              {step === 1 && (
                <div style={{ marginTop: 30 }}>
                  <Button primary onClick={handleCount} disabled={!canSubmit}>
                    {t('editor/replace/button/search')}
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div style={{ marginTop: 15 }}>
                  <Field
                    ref={replaceRef}
                    label='Ersetzen'
                    value={displayReplaceTerm}
                    onChange={(_, value) =>
                      setDisplayReplaceTerm(value as string)
                    }
                  />

                  <small>{t('editor/replace/searchReplaceHint')}</small>
                  <div style={{ marginTop: 15 }}>
                    <Button
                      primary
                      onClick={handleReplace}
                      style={{ marginRight: 15 }}
                      disabled={!canSubmit}
                    >
                      {t('editor/replace/button/replace')}
                    </Button>
                    <Button onClick={handleBack}>
                      {t('editor/replace/button/back')}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </OverlayBody>
        </Overlay>
      )}
    </>
  )
}

export default Replace
