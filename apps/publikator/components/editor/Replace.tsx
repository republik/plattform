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
    if (node.type === 'text') {
      return {
        ...node,
        value: node.value.replace(searchTerm, replaceTerm),
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
  const metaReplacement = allMetaKeys.reduce((next, key) => {
    return {
      ...next,
      [key]: metaKeys.includes(key)
        ? meta[key].replace(searchTerm, replaceTerm)
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
  const [searchTerm, setSearchTerm] = useState<string>()
  const [replaceTerm, setReplaceTerm] = useState<string>()
  const [includeMeta, setIncludeMeta] = useState<boolean>()
  const ref = useRef<HTMLDivElement>()

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

  useEffect(() => {
    const keyDownHandler = (event) => {
      console.log('User pressed: ', event.key)
    }
    document.addEventListener('keydown', keyDownHandler)

    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [])

  const handleClick = (e) => {
    console.log('handler called')
    e.preventDefault()
    const event = new KeyboardEvent('keydown', { key: 'a' })
    document.dispatchEvent(event)
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
                onMouseDown={handleClick}
              >
                Dauerleerzeichen (
                <span style={{ color: 'rgb(30, 144, 255)' }}>␣</span>)
              </button>
              <button {...plainButtonRule}>
                Weiches Trennzeichen (
                <span style={{ color: 'rgb(30, 144, 255)' }}>‧</span>)
              </button>
            </div>
            <Field
              ref={ref}
              label='Suchen'
              value={searchTerm}
              onChange={(_, value) => setSearchTerm(value)}
            />
            <Field
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
