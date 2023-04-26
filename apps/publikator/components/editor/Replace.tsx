import { css } from 'glamor'
import React, { useState } from 'react'
import {
  Overlay,
  OverlayToolbar,
  OverlayBody,
  Field,
  Button,
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

const Replace: React.FC<{ value: any; onSave: (e: any) => undefined }> = ({
  value,
  onSave,
}) => {
  const [isReplacerVisible, setReplacerVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>()
  const [replaceTerm, setReplaceTerm] = useState<string>()

  const title = 'Suchen und ersetzen'
  const closeReplacer = () => setReplacerVisible(false)

  // todo: checkbox to replace in meta block
  // iterate through meta keys and replace titles & descriptions

  const replace = () => {
    const newValue = {
      ...value,
      children: value.children.map(replaceText(searchTerm, replaceTerm)),
    }
    onSave(newValue)
    closeReplacer()
  }
  return (
    <>
      <button onClick={() => setReplacerVisible(true)}>{title}</button>
      {isReplacerVisible && (
        <Overlay
          onClose={closeReplacer}
          mUpStyle={{ maxWidth: 400, minHeight: 0 }}
        >
          <OverlayToolbar title={title} onClose={closeReplacer} />
          <OverlayBody>
            <div style={{ textAlign: 'center' }}>
              <Field
                label='Suchen'
                value={searchTerm}
                onChange={(_, value) => setSearchTerm(value)}
              />
              <Field
                label='Ersetzen'
                value={replaceTerm}
                onChange={(_, value) => setReplaceTerm(value)}
              />
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
