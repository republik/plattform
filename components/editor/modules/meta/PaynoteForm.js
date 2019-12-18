import React from 'react'

import { css } from 'glamor'
import AutosizeInput from 'react-textarea-autosize'

import { Field, Radio, Label, colors } from '@project-r/styleguide'
import withT from '../../../../lib/withT'

const styles = {
  autoSize: css({
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important',
    background: 'transparent'
  }),
  title: css({
    padding: '5px 0',
    fontWeight: 'bold'
  }),
  ctaLabel: css({
    display: 'block',
    paddingBottom: 5
  })
}

const SelectCta = withT(({ t, cta, setCta }) => {
  const options = ['trialForm', 'button', undefined]

  return (
    <>
      <Label {...styles.ctaLabel}>{t('metaData/paynote/form/cta/label')}</Label>
      {options.map((option, i) => (
        <Radio
          key={i}
          checked={cta === option}
          onChange={() => setCta(option)}
          style={{ marginRight: 30 }}
        >
          {t(`metaData/paynote/form/cta/${i}`)}
        </Radio>
      ))}
    </>
  )
})

export default withT(({ t, data, name, onInputChange }) => {
  return (
    <div>
      <Label {...styles.title}>{name}</Label>
      <Field
        label={t('metaData/paynote/form/title')}
        name='title'
        value={data.title}
        onChange={(e, value) =>
          onInputChange({
            title: value
          })
        }
      />
      <Field
        label={t('metaData/paynote/form/body')}
        name='body'
        value={data.body}
        onChange={(e, value) =>
          onInputChange({
            body: value
          })
        }
        renderInput={({ ref, ...inputProps }) => (
          <AutosizeInput {...inputProps} {...styles.autoSize} inputRef={ref} />
        )}
      />
      <SelectCta
        cta={data.cta}
        setCta={cta => {
          onInputChange({ cta })
        }}
      />
      {data.cta === 'button' && (
        <>
          <Field
            label={t('metaData/paynote/form/button/label')}
            name='buttonText'
            value={data.button.label}
            onChange={(e, value) =>
              onInputChange({
                button: {
                  ...data.button,
                  label: value
                }
              })
            }
          />
          <Field
            label={t('metaData/paynote/form/button/link')}
            name='button/text'
            value={data.button.link}
            onChange={(e, value) =>
              onInputChange({
                button: {
                  ...data.button,
                  link: value
                }
              })
            }
          />
        </>
      )}
    </div>
  )
})
