import React from 'react'
import { css } from 'glamor'
import { Map } from 'immutable'

import { Interaction, Field, colors } from '@project-r/styleguide'
import AutosizeInput from 'react-textarea-autosize'

import withT from '../../lib/withT'
import ImageInput from './ImageInput'

const styles = {
  container: css({
    marginTop: 100,
    backgroundColor: colors.secondaryBg,
    padding: 30
  }),
  center: css({
    maxWidth: 640,
    margin: '0 auto'
  }),
  autoSize: css({
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important'
  })
}

const Form = ({state, onChange, t}) => {
  const defaultValues = Map({
    title: '',
    description: '',
    image: ''
  })
  const node = state.document
  const data = defaultValues.merge(
    node.data
  )

  return (
    <div {...styles.container}>
      <div {...styles.center}>
        <Interaction.H2>{t('metaData/title')}</Interaction.H2>
        {data.map((value, key) => {
          const label = t(`metaData/field/${key}`, undefined, key)
          const onInputChange = (_, value) => {
            const newData = node.data.remove('auto')

            onChange(
              state
                .transform()
                .setNodeByKey(node.key, {
                  data: value
                    ? newData.set(key, value)
                    : newData.remove(key)
                })
                .apply()
            )
          }
          if (key.match(/image/i)) {
            return <ImageInput key={key}
              label={label}
              src={value}
              onChange={onInputChange} />
          }
          let renderInput
          if (key.match(/description/i)) {
            renderInput = ({ref, ...inputProps}) => (
              <AutosizeInput {...styles.autoSize}
                {...inputProps}
                inputRef={ref} />
            )
          }
          return (
            <Field
              key={key}
              label={label}
              name={key}
              value={value}
              renderInput={renderInput}
              black
              onChange={onInputChange} />
          )
        }).toArray()}
      </div>
    </div>
  )
}

export default withT(Form)
