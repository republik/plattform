import { css } from 'glamor'
import { useState } from 'react'
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

const Replace = () => {
  const [isReplacerVisible, setReplacerVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>()
  const [replaceTerm, setReplaceTerm] = useState<string>()

  const title = 'Suchen und ersetzen'
  const closeReplacer = () => setReplacerVisible(false)

  // todo: checkbox to replace in meta block

  const replace = () => {
    console.log('replacing!')
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
