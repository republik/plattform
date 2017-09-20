import React from 'react'
import { css } from 'glamor'

import { Field, Checkbox } from '@project-r/styleguide'
import AutosizeInput from 'react-textarea-autosize'

import withT from '../../../lib/withT'

import ImageInput from './ImageInput'

const defaultGetWidth = () => '100%'

const GUTTER = 20
const styles = {
  grid: css({
    clear: 'both',
    width: `calc(100% + ${GUTTER}px)`,
    margin: `0 -${GUTTER / 2}px`,
    ':after': {
      content: '""',
      display: 'table',
      clear: 'both'
    }
  }),
  span: css({
    float: 'left',
    paddingLeft: `${GUTTER / 2}px`,
    paddingRight: `${GUTTER / 2}px`,
    minHeight: 1,
    width: '50%'
  }),
  autoSize: css({
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important'
  })
}

const Form = ({
  t,
  onInputChange,
  data,
  getWidth = defaultGetWidth,
  black
}) => (
  <div {...styles.grid}>
    {data.map((value, key) => {
      const label = t(`metaData/field/${key}`, undefined, key)

      let input
      if (key.match(/image|src/i)) {
        input = <ImageInput
          maxWidth='100%'
          label={label}
          src={value}
          onChange={onInputChange(key)} />
      } else if (typeof value === 'boolean') {
        input = <Checkbox checked={value} onChange={onInputChange(key)} black={black}>
          {label}
        </Checkbox>
      } else {
        let renderInput
        if (key.match(/description/i)) {
          renderInput = ({ref, ...inputProps}) => (
            <AutosizeInput {...styles.autoSize}
              {...inputProps}
              inputRef={ref} />
          )
        }
        input = <Field
          label={label}
          name={key}
          value={value}
          renderInput={renderInput}
          black={black}
          onChange={onInputChange(key)} />
      }
      return (
        <div
          key={key}
          {...styles.span}
          style={{width: getWidth(key)}}>
          {input}
        </div>
      )
    }).toArray()}
  </div>
)

export default withT(Form)
