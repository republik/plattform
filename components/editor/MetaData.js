import React from 'react'
import { css } from 'glamor'
import { Map, Set } from 'immutable'

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
  }),
  fbContainer: css({
    backgroundColor: '#fff',
    color: '#000',
    width: 476
  }),
  fbImage: css({
    width: 476,
    height: 249,
    backgroundSize: 'cover'
  }),
  fbText: css({
    padding: '10px 12px',
    maxHeight: 120,
    overflow: 'hidden'
  }),
  fbTitle: css({
    fontFamily: 'Georgia, serif',
    fontSize: 18,
    fontWeight: 500,
    lineHeight: '22px',
    maxHeight: 110,
    overflow: 'hidden',
    marginBottom: 5,
    wordWrap: 'break-word'
  }),
  fbDescription: css({
    fontFamily: 'sans-serif',
    fontSize: 12,
    lineHeight: '16px',
    maxHeight: 80,
    overflow: 'hidden'
  }),
  fbDomain: css({
    fontFamily: 'sans-serif',
    fontSize: 11,
    lineHeight: '11px',
    textTransform: 'uppercase',
    color: '#90949c',
    paddingTop: 9
  })
}

const FBPreview = ({data}) => (
  <div {...styles.fbContainer}>
    <div {...styles.fbImage} style={{
      backgroundImage: `url(${data.get('facebookImage') || data.get('image')})`
    }} />
    <div {...styles.fbText}>
      <div {...styles.fbTitle}>
        {data.get('facebookTitle') || data.get('title')}
      </div>
      <div {...styles.fbDescription}>
        {data.get('facebookDescription') || data.get('description')}
      </div>
      <div {...styles.fbDomain}>
        republik.ch
      </div>
    </div>
  </div>
)

const Form = ({onInputChange, data, t}) => (
  <div>
    {data.map((value, key) => {
      const label = t(`metaData/field/${key}`, undefined, key)

      if (key.match(/image/i)) {
        return <ImageInput key={key}
          label={label}
          src={value}
          onChange={onInputChange(key)} />
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
          onChange={onInputChange(key)} />
      )
    }).toArray()}
  </div>
)

const MetaData = ({state, onChange, t}) => {
  const node = state.document

  const genericKeys = Set([
    'slug',
    'emailSubject',
    'title',
    'description',
    'image'
  ])
  const gernericDefaultValues = Map(genericKeys.map(key => [key, '']))
  const genericData = gernericDefaultValues.merge(
    node.data.filter((_, key) => genericKeys.has(key))
  )

  const fbKeys = Set([
    'facebookTitle',
    'facebookDescription',
    'facebookImage'
  ])
  const fbDefaultValues = Map(fbKeys.map(key => [key, '']))
  const fbData = fbDefaultValues.merge(
    node.data.filter((_, key) => fbKeys.has(key))
  )

  const onInputChange = key => (_, value) => {
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

  return (
    <div {...styles.container}>
      <div {...styles.center}>
        <Interaction.H2>
          {t('metaData/title')}
        </Interaction.H2>
        <br />
        <Form data={genericData} onInputChange={onInputChange} t={t} />
        <br /><br />
        <Interaction.H3>
          Facebook Vorschau
        </Interaction.H3>
        <FBPreview data={node.data} />
        <Form data={fbData} onInputChange={onInputChange} t={t} />
      </div>
    </div>
  )
}

export default withT(MetaData)
