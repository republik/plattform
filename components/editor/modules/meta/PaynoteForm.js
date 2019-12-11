import React, { useState } from 'react'
import { Field, Checkbox, Label, Radio } from '@project-r/styleguide'
import withT from '../../../../lib/withT'
import AutosizeInput from 'react-textarea-autosize'
import { css } from 'glamor'

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
        onChange={e => setTrynote(e, false)}
        style={{ marginRight: 30 }}
      >
        buynote
      </Radio>
      <Radio checked={!!isTrynote} onChange={e => setTrynote(e, true)}>
        trynote
      </Radio>
    </>
  )
})

export default withT(({ t, data, onInputChange }) => {
  const [bottomFields, showBottomFields] = useState(false)

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
        setTrynote={value => onInputChange({ isTrynote: value })}
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
      <Checkbox
        checked={bottomFields}
        onChange={(_, value) => {
          showBottomFields(value)
          !value && resetBottomFields()
        }}
      >
        edit bottom paynote text
      </Checkbox>
      {bottomFields && (
        <>
          <Field
            label='title bottom'
            name='titleBottom'
            value={data.titleBottom}
            onChange={(e, value) =>
              onInputChange({
                titleBottom: value
              })
            }
          />
          <Field
            label='body bottom'
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
          <Field
            label='cta bottom'
            name='ctaBottom'
            value={data.ctaBottom}
            onChange={(e, value) =>
              onInputChange({
                ctaBottom: value
              })
            }
          />
        </>
      )}
    </div>
  )
})
