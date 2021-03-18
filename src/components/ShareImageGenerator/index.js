import React, { useState, useMemo } from 'react'
import { css } from 'glamor'
import Textarea from 'react-textarea-autosize'

import ShareImagePreview from './ShareImagePreview'
import Checkbox from '../Form/Checkbox'
import Dropdown from '../Form/Dropdown'
import Field from '../Form/Field'
import { useColorContext } from '../Colors/useColorContext'
import { fontStyles } from '../../theme/fonts'

const styles = {
  container: css({
    width: 600,
    margin: 0
  }),
  controlsContainer: css({
    width: 600,
    margin: 0,
    display: 'flex',
    justifyContent: 'space-between'
  }),
  textArea: css({
    display: 'block',
    textAlign: 'center',
    padding: '20px 8px',
    margin: '8px 0',
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    minHeight: '60px',
    background: 'transparent',
    border: '1px solid',
    outline: 'none',
    boxSizing: 'border-box'
  })
}

const ShareImageGenerator = ({ format }) => {
  const [coloredBackground, setColoredBackground] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState(true)
  const [textPosition, setTextPosition] = useState('bottom')
  const [text, setText] = useState()
  const [fontSize, setFontSize] = useState(60)
  const [fontStyle, setFontStyle] = useState(fontStyles.serifBold)
  const [colorScheme] = useColorContext()

  const textAreaEmptyRule = useMemo(
    () =>
      css({
        color: colorScheme.getCSSColor('textSoft'),
        '::-webkit-input-placeholder': {
          color: colorScheme.getCSSColor('textSoft')
        }
      }),
    [colorScheme]
  )

  const fontDropdownItems = [
    {
      value: fontStyles.serifBold,
      text: 'Republik',
      element: <span style={{ ...fontStyles.serifBold }}>Republik</span>
    },
    {
      value: fontStyles.cursiveTitle,
      text: 'Cursive',
      element: <span style={{ ...fontStyles.cursiveTitle }}>Cursive</span>
    },
    {
      value: fontStyles.sansSerifRegular,
      text: 'GT America',
      element: (
        <span style={{ ...fontStyles.sansSerifRegular }}>GT America</span>
      )
    }
  ]

  const fontStyleFromKind =
    format?.kind === 'scribble'
      ? fontStyles.cursiveTitle
      : format?.kind === 'editorial'
      ? fontStyles.serifBold
      : format?.kind === 'meta'
      ? fontStyles.sansSerifRegular
      : undefined

  return (
    <div {...styles.container}>
      <div {...styles.controlsContainer}>
        <div style={{ width: 160, display: 'flex', alignItems: 'center' }}>
          <Checkbox
            checked={coloredBackground}
            onChange={() => setColoredBackground(!coloredBackground)}
          >
            Hintergrundfarbe
          </Checkbox>
        </div>
        {!format || format?.type === 'Dialog' ? (
          <div style={{ width: 160 }}>
            <Dropdown
              label='Schriftart'
              items={
                format?.type === 'Meta' || format?.type === 'Dialog'
                  ? [fontDropdownItems[0], fontDropdownItems[2]]
                  : fontDropdownItems
              }
              value={fontStyle}
              onChange={item => setFontStyle(item.value)}
            />
          </div>
        ) : null}
        <div style={{ width: 100 }}>
          <Field
            label='Schriftgrösse'
            value={fontSize}
            onChange={e => setFontSize(e.target.value)}
            onInc={() => setFontSize(fontSize + 1)}
            onDec={() => setFontSize(fontSize - 1)}
          />
        </div>
      </div>
      {format?.type === 'Kolumnen' ? (
        <>
          <Checkbox
            checked={backgroundImage}
            onChange={() => setBackgroundImage(!backgroundImage)}
          >
            Mit Hintergrundbild
          </Checkbox>
          {backgroundImage ? (
            <Dropdown
              label='Textposition'
              items={[
                { value: 'top', text: 'Oben' },
                { value: 'center', text: 'Mitte' },
                { value: 'bottom', text: 'Unten' }
              ]}
              value={textPosition}
              onChange={item => setTextPosition(item.value)}
            />
          ) : null}
        </>
      ) : null}
      <Textarea
        {...styles.textArea}
        {...colorScheme.set('color', 'text')}
        {...colorScheme.set('borderColor', 'divider')}
        {...(text === '' ? textAreaEmptyRule : {})}
        placeholder={'Text für Social Image'}
        value={text}
        rows='1'
        onChange={e => setText(e.target.value)}
      />

      <ShareImagePreview
        format={format}
        coloredBackground={coloredBackground}
        text={text}
        fontSize={fontSize}
        fontStyle={fontStyleFromKind || fontStyle}
        // below only used for Kolumnen
        textPosition={textPosition}
        backgroundImage={backgroundImage}
      />
    </div>
  )
}

export default ShareImageGenerator
