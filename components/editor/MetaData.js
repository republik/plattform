import React from 'react'
import { css } from 'glamor'
import { Map } from 'immutable'

import { Interaction, Field, colors } from '@project-r/styleguide'
import AutosizeInput from 'react-textarea-autosize'

import withT from '../../lib/withT'

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
    description: ''
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
              label={t(`metaData/field/${key}`, undefined, key)}
              name={key}
              value={value}
              renderInput={renderInput}
              black
              onChange={(_, value, shouldValidate) => {
                onChange(
                  state
                    .transform()
                    .setNodeByKey(node.key, {
                      data: value
                        ? node.data.set(key, value)
                        : node.data.remove(key)
                    })
                    .apply()
                )
              }} />
          )
        }).toArray()}
      </div>
    </div>
  )
}

export default withT(Form)
