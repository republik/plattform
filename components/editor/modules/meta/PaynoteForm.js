import React, { useState } from 'react'

import { css } from 'glamor'
import AutosizeInput from 'react-textarea-autosize'

import { Field, Checkbox, Radio } from '@project-r/styleguide'
import withT from '../../../../lib/withT'

const styles = {
  autoSize: css({
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important',
    background: 'transparent'
  })
}

const SelectPaynoteType = withT(({ t, isTrynote, setTrynote }) => {
  return (
    <>
      <Radio
        checked={!isTrynote}
        onChange={() => setTrynote(false)}
        style={{ marginRight: 30 }}
      >
        {t('metaData/paynote/form/buynote')}
      </Radio>
      <Radio checked={!!isTrynote} onChange={() => setTrynote(true)}>
        {t('metaData/paynote/form/trynote')}
      </Radio>
    </>
  )
})

export default withT(({ t, data, onInputChange }) => {
  const hasDifferentBottomFields = () =>
    data.beforeTitle !== data.afterTitle ||
    data.beforeBody !== data.afterBody ||
    data.beforeButton !== data.afterButton

  const [bottomFields, showBottomFields] = useState(hasDifferentBottomFields)

  const resetBottomFields = () =>
    onInputChange({
      afterTitle: data.beforeTitle,
      afterBody: data.beforeBody,
      afterButton: data.beforeButton
    })

  return (
    <div>
      <SelectPaynoteType
        isTrynote={data.isTrynote}
        setTrynote={isTrynote => {
          onInputChange({
            isTrynote,
            beforeButton: '',
            afterButton: ''
          })
        }}
      />
      <Field
        label={t('metaData/paynote/form/before/title')}
        name='beforeTitle'
        value={data.beforeTitle}
        onChange={(e, value) =>
          onInputChange({
            beforeTitle: value,
            afterTitle: bottomFields ? data.afterTitle : value
          })
        }
      />
      <Field
        label={t('metaData/paynote/form/before/body')}
        name='beforeBody'
        value={data.beforeBody}
        onChange={(e, value) =>
          onInputChange({
            beforeBody: value,
            afterBody: bottomFields ? data.afterBody : value
          })
        }
        renderInput={({ ref, ...inputProps }) => (
          <AutosizeInput {...inputProps} {...styles.autoSize} inputRef={ref} />
        )}
      />
      {!data.isTrynote && (
        <Field
          label={t('metaData/paynote/form/before/button')}
          name='beforeButton'
          value={data.beforeButton}
          onChange={(e, value) =>
            onInputChange({
              beforeButton: value,
              afterButton: bottomFields ? data.afterButton : value
            })
          }
        />
      )}
      <br />
      <br />
      <Checkbox
        checked={bottomFields}
        onChange={(_, value) => {
          showBottomFields(value)
          !value && resetBottomFields()
        }}
      >
        {t('metaData/paynote/form/hasDifferentPaynotes')}
      </Checkbox>
      {bottomFields && (
        <>
          <Field
            label={t('metaData/paynote/form/after/title')}
            name='afterTitle'
            value={data.afterTitle}
            onChange={(e, value) =>
              onInputChange({
                afterTitle: value
              })
            }
          />
          <Field
            label={t('metaData/paynote/form/after/body')}
            name='afterBody'
            value={data.afterBody}
            onChange={(e, value) =>
              onInputChange({
                afterBody: value
              })
            }
            renderInput={({ ref, ...inputProps }) => (
              <AutosizeInput
                {...inputProps}
                {...styles.autoSize}
                inputRef={ref}
              />
            )}
          />
          {!data.isTrynote && (
            <Field
              label={t('metaData/paynote/form/after/button')}
              name='afterButton'
              value={data.afterButton}
              onChange={(e, value) =>
                onInputChange({
                  afterButton: value
                })
              }
            />
          )}
        </>
      )}
    </div>
  )
})
