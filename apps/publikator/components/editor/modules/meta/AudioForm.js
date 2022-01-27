import React, { Fragment } from 'react'
import { Set, Map } from 'immutable'

import { Label, Field, Dropdown } from '@project-r/styleguide'

import MetaForm from '../../utils/MetaForm'
import withT from '../../../../lib/withT'

import UIForm from '../../UIForm'

export default withT(({ t, editor, node, onInputChange }) => {
  const audioCoverAnchors = [null, 'middle'].map(value => ({
    value,
    text: t(`metaData/audio/cover/anchor/${value}`)
  }))

  const onChange = key => newValue => {
    editor.change(change => {
      change.setNodeByKey(node.key, {
        data:
          newValue !== null
            ? node.data.set(key, newValue)
            : node.data.remove(key)
      })
    })
  }

  const audioCover = node.data.get('audioCover')

  const audioSourceKeys = Set(['audioSourceMp3', 'audioSourceAac'])
  const audioDefaultValues = Map(audioSourceKeys.map(key => [key, '']))
  const audioSourceData = audioDefaultValues.merge(
    node.data.filter((_, key) => audioSourceKeys.has(key))
  )

  return (
    <Fragment>
      <Label>{t('metaData/audio')}</Label>
      <br />
      <MetaForm
        data={audioSourceData}
        onInputChange={onInputChange}
        getWidth={() => ''}
        black
      />
      <UIForm getWidth={() => '25%'}>
        <Dropdown
          black
          label={t('metaData/audio/cover/anchor')}
          items={audioCoverAnchors}
          value={audioCover ? audioCover.anchor : null}
          onChange={({ value }) =>
            onChange('audioCover')(
              value && {
                anchor: value,
                color: (audioCover && audioCover.color) || '#fff',
                backgroundColor:
                  (audioCover && audioCover.backgroundColor) ||
                  'rgba(255,255,255,0.3)'
              }
            )
          }
        />
        {audioCover && (
          <Field
            black
            label={t('metaData/audio/cover/color')}
            value={audioCover.color}
            onChange={(_, color) => {
              onChange('audioCover')({
                ...audioCover,
                color
              })
            }}
          />
        )}
        {audioCover && (
          <Field
            black
            label={t('metaData/audio/cover/backgroundColor')}
            value={audioCover.backgroundColor}
            onChange={(_, backgroundColor) => {
              onChange('audioCover')({
                ...audioCover,
                backgroundColor
              })
            }}
          />
        )}
      </UIForm>
    </Fragment>
  )
})
