import React, { useMemo } from 'react'
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  }),
  controlItem: css({
    margin: '0 32px 0 0',
    maxWidth: 170,
    '&:last-of-type ': {
      margin: 0
    }
  }),
  checkboxContainer: css({
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    paddingTop: 8
  }),
  textArea: css({
    display: 'block',
    textAlign: 'center',
    padding: '20px 8px',
    margin: '8px 0',
    width: '600px',
    minHeight: '60px',
    background: 'transparent',
    border: '1px solid',
    outline: 'none',
    boxSizing: 'border-box'
  })
}

const PLACEHOLDER_TEXT = 'Text für Sharebild'

const getFormatType = format => format?.section?.meta?.title
export const hasCustomFontStyle = format =>
  !format || getFormatType(format) === 'Dialog'

const ShareImageGenerator = ({
  format,
  fontSize,
  onFontSizeChange,
  onFontSizeInc,
  onFontSizeDec,
  textPosition,
  onTextPositionChange,
  inverted,
  onInvertedChange,
  text,
  onTextChange,
  socialKey,
  embedPreview
}) => {
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

  return (
    <div {...styles.container}>
      <div {...styles.controlsContainer}>
        <div {...styles.controlItem}>
          <Field
            label='Schriftgrösse'
            value={fontSize}
            onChange={onFontSizeChange}
            onInc={onFontSizeInc}
            onDec={onFontSizeDec}
          />
        </div>
        {format?.shareBackgroundImage ? (
          <div {...styles.controlItem} style={{ minWidth: 170 }}>
            <Dropdown
              label='Textposition'
              items={[
                { value: 'top', text: 'Oben' },
                { value: 'center', text: 'Mitte' },
                { value: 'bottom', text: 'Unten' }
              ]}
              value={textPosition}
              onChange={onTextPositionChange}
            />
          </div>
        ) : null}
        <div {...styles.controlItem} {...styles.checkboxContainer}>
          <Checkbox checked={inverted} onChange={onInvertedChange}>
            Hintergrundfarbe
          </Checkbox>
        </div>
      </div>

      <Textarea
        {...styles.textArea}
        {...colorScheme.set('color', 'text')}
        {...colorScheme.set('borderColor', 'divider')}
        {...(text === '' && textAreaEmptyRule)}
        placeholder={PLACEHOLDER_TEXT}
        value={text}
        rows='1'
        onChange={onTextChange}
      />

      <ShareImagePreview
        format={format}
        inverted={inverted}
        text={text}
        fontSize={fontSize}
        textPosition={textPosition}
        // only used in conjunction with generator
        placeholderText={PLACEHOLDER_TEXT}
        socialKey={socialKey}
        embedPreview={embedPreview}
      />
    </div>
  )
}

export default ShareImageGenerator
