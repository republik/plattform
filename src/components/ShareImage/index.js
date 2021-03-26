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
    maxWidth: 180,
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

const capitalise = word => word.replace(/^\w/, c => c.toUpperCase())

export const addSocialPrefix = socialKey => key => socialKey + capitalise(key)

const ShareImageGenerator = ({
  format,
  data,
  onInputChange,
  socialKey,
  embedPreview
}) => {
  const [colorScheme] = useColorContext()

  const formatType = format?.section?.meta?.title

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
      value: 'serifBold',
      text: 'Republik',
      element: (
        <span
          style={{
            ...fontStyles.serifBold,
            fontSize: 16,
            lineHeight: '18px'
          }}
        >
          Republik
        </span>
      )
    },
    {
      value: 'cursiveTitle',
      text: 'Cursive',
      element: (
        <span
          style={{
            ...fontStyles.cursiveTitle,
            fontSize: 16,
            lineHeight: '18px'
          }}
        >
          Cursive
        </span>
      )
    },
    {
      value: 'sansSerifRegular',
      text: 'GT America',
      element: (
        <span
          style={{
            ...fontStyles.sansSerifRegular,
            fontSize: 16,
            lineHeight: '18px'
          }}
        >
          GT America
        </span>
      )
    }
  ]

  const withPrefix = useMemo(() => addSocialPrefix(socialKey), [socialKey])

  const getData = key => data.get(withPrefix(key))
  const onChange = key => onInputChange(withPrefix(key))
  const onChangeValue = (key, value) => onChange(key)(undefined, value)
  const incrementFontSize = increment => () =>
    onChange('fontSize')(undefined, getData('fontSize') + increment)

  const placeholderText = `Text für ${capitalise(socialKey)}`

  return (
    <div {...styles.container}>
      <div {...styles.controlsContainer}>
        {!format || formatType === 'Dialog' ? (
          <div {...styles.controlItem} style={{ minWidth: 160 }}>
            <Dropdown
              label='Schriftart'
              items={
                formatType === 'Dialog'
                  ? [fontDropdownItems[0], fontDropdownItems[2]]
                  : fontDropdownItems
              }
              value={getData('fontStyle')}
              onChange={item => onChangeValue('fontStyle', item.value)}
            />
          </div>
        ) : null}
        <div {...styles.controlItem}>
          <Field
            label='Schriftgrösse'
            value={getData('fontSize')}
            onChange={(e, value) =>
              onChangeValue('fontSize', Number(value) || undefined)
            }
            onInc={incrementFontSize(1)}
            onDec={incrementFontSize(-1)}
          />
        </div>
        {format?.shareImage ? (
          <div {...styles.controlItem} style={{ maxWidth: 160 }}>
            {getData('illuBackground') ? (
              <Dropdown
                label='Textposition'
                items={[
                  { value: 'top', text: 'Oben' },
                  { value: 'center', text: 'Mitte' },
                  { value: 'bottom', text: 'Unten' }
                ]}
                value={getData('textPosition')}
                onChange={item => {
                  onChangeValue('textPosition', item.value)
                }}
              />
            ) : (
              <Field label='Textposition' value='Mitte' disabled />
            )}
          </div>
        ) : null}
        <div {...styles.controlItem} {...styles.checkboxContainer}>
          <Checkbox
            checked={getData('coloredBackground')}
            onChange={onChange('coloredBackground')}
          >
            Hintergrundfarbe
          </Checkbox>
        </div>
        {format?.shareImage ? (
          <div {...styles.controlItem} {...styles.checkboxContainer}>
            <Checkbox
              checked={getData('illuBackground')}
              onChange={onChange('illuBackground')}
            >
              Mit Hintergrundbild
            </Checkbox>
          </div>
        ) : null}
      </div>

      <Textarea
        {...styles.textArea}
        {...colorScheme.set('color', 'text')}
        {...colorScheme.set('borderColor', 'divider')}
        {...(getData('text') === '' && textAreaEmptyRule)}
        placeholder={placeholderText}
        value={getData('text')}
        rows='1'
        onChange={e => onChangeValue('text', e.target.value)}
      />

      <ShareImagePreview
        format={format}
        coloredBackground={getData('coloredBackground')}
        text={getData('text')}
        fontSize={getData('fontSize')}
        customFontStyle={getData('fontStyle')}
        textPosition={getData('textPosition')}
        illuBackground={getData('illuBackground')}
        // only used in conjunction with generator
        placeholderText={placeholderText}
        socialKey={socialKey}
        embedPreview={embedPreview}
      />
    </div>
  )
}

export default ShareImageGenerator
