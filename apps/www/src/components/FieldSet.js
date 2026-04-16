import { css } from 'glamor'

import AutosizeInput from 'react-textarea-autosize'
import MaskedInput from 'react-maskedinput'

import { FieldSet } from '@project-r/styleguide'

export const styles = {
  mask: css({
    '::placeholder': {
      color: 'transparent',
    },
    ':focus': {
      '::placeholder': {
        color: '#ccc',
      },
    },
  }),
  autoSize: css({
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important',
    background: 'transparent',
  }),
}

const FieldSetWithMaskAndAutoSize = (props) => (
  <FieldSet
    {...props}
    additionalFieldProps={(field) => {
      const fieldProps = props.additionalFieldProps
        ? props.additionalFieldProps(field)
        : {}
      if (field.autoSize) {
        fieldProps.renderInput = ({ ref, ...inputProps }) => (
          <AutosizeInput {...styles.autoSize} {...inputProps} inputRef={ref} />
        )
      }
      if (field.mask) {
        fieldProps.renderInput = (inputProps) => (
          <MaskedInput
            {...inputProps}
            {...styles.mask}
            placeholderChar={field.maskChar || ' '}
            mask={field.mask}
          />
        )
      }
      return fieldProps
    }}
  />
)

FieldSetWithMaskAndAutoSize.utils = FieldSet.utils

export default FieldSetWithMaskAndAutoSize
