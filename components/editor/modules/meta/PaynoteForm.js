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
        buynote
      </Radio>
      <Radio checked={!!isTrynote} onChange={() => setTrynote(true)}>
        trynote
      </Radio>
    </>
  )
})

export default withT(({ t, data, onInputChange }) => {
  const hasDifferentBottomFields = () =>
    data.titleTop !== data.titleBottom ||
    data.bodyTop !== data.bodyBottom ||
    data.ctaTop !== data.ctaBottom

  const [bottomFields, showBottomFields] = useState(hasDifferentBottomFields)

  const resetBottomFields = () =>
    onInputChange({
      titleBottom: data.titleTop,
      bodyBottom: data.bodyTop,
      ctaBottom: data.ctaTop
    })

  return (
    <div>
      <SelectPaynoteType
        isTrynote={data.isTrynote}
        setTrynote={isTrynote => {
          onInputChange({
            isTrynote,
            ctaTop: isTrynote ? '' : data.ctaTop,
            ctaBottom: isTrynote ? '' : data.ctaBottom
          })
        }}
      />
      <Field
        label='title'
        name='titleTop'
        value={data.titleTop}
        onChange={(e, value) =>
          onInputChange({
            titleTop: value,
            titleBottom: bottomFields ? data.titleBottom : value
          })
        }
      />
      <Field
        label='body'
        name='bodyTop'
        value={data.bodyTop}
        onChange={(e, value) =>
          onInputChange({
            bodyTop: value,
            bodyBottom: bottomFields ? data.bodyBottom : value
          })
        }
        renderInput={({ ref, ...inputProps }) => (
          <AutosizeInput {...inputProps} {...styles.autoSize} inputRef={ref} />
        )}
      />
      {!data.isTrynote && (
        <Field
          label='cta'
          name='ctaTop'
          value={data.ctaTop}
          onChange={(e, value) =>
            onInputChange({
              ctaTop: value,
              ctaBottom: bottomFields ? data.ctaBottom : value
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
        different footer text
      </Checkbox>
      {bottomFields && (
        <>
          <Field
            label='footer title'
            name='titleBottom'
            value={data.titleBottom}
            onChange={(e, value) =>
              onInputChange({
                titleBottom: value
              })
            }
          />
          <Field
            label='footer body'
            name='bodyBottom'
            value={data.bodyBottom}
            onChange={(e, value) =>
              onInputChange({
                bodyBottom: value
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
              label='footer cta'
              name='ctaBottom'
              value={data.ctaBottom}
              onChange={(e, value) =>
                onInputChange({
                  ctaBottom: value
                })
              }
            />
          )}
        </>
      )}
    </div>
  )
})
