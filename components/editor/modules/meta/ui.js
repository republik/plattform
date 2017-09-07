import React from 'react'
import { css } from 'glamor'
import { Map, Set } from 'immutable'

import { Interaction, Field, Label, colors } from '@project-r/styleguide'
import AutosizeInput from 'react-textarea-autosize'

import withT from '../../../../lib/withT'
import ImageInput from './ImageInput'
import FBPreview from './FBPreview'
import TwitterPreview from './TwitterPreview'

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

const defaultGetWidth = key => key.match(/title/i) ? '100%' : ''

const Form = ({
  t,
  onInputChange,
  data,
  getWidth = defaultGetWidth
}) => (
  <div {...styles.grid}>
    {data.map((value, key) => {
      const label = t(`metaData/field/${key}`, undefined, key)

      if (key.match(/image/i)) {
        return (
          <div key={key} {...styles.span}>
            <ImageInput
              maxWidth='100%'
              label={label}
              src={value}
              onChange={onInputChange(key)} />
          </div>
        )
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
        <div
          key={key}
          {...styles.span}
          style={{width: getWidth(key)}}>
          <Field
            label={label}
            name={key}
            value={value}
            renderInput={renderInput}
            black
            onChange={onInputChange(key)} />
        </div>
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
    'image',
    'description'
  ])
  const genericDefaultValues = Map(genericKeys.map(key => [key, '']))
  const genericData = genericDefaultValues.merge(
    node.data.filter((_, key) => genericKeys.has(key))
  )

  const fbKeys = Set([
    'facebookTitle',
    'facebookImage',
    'facebookDescription'
  ])
  const fbDefaultValues = Map(fbKeys.map(key => [key, '']))
  const fbData = fbDefaultValues.merge(
    node.data.filter((_, key) => fbKeys.has(key))
  )

  const twitterKeys = Set([
    'twitterTitle',
    'twitterImage',
    'twitterDescription'
  ])
  const twitterDefaultValues = Map(twitterKeys.map(key => [key, '']))
  const twitterData = twitterDefaultValues.merge(
    node.data.filter((_, key) => twitterKeys.has(key))
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
        <br /><br /><br />
        <Form data={fbData} onInputChange={onInputChange} t={t} />
        <Label>{t('metaData/preview')}</Label><br />
        <FBPreview data={node.data} />
        <br /><br /><br />
        <Form data={twitterData} onInputChange={onInputChange} t={t} />
        <Label>{t('metaData/preview')}</Label><br />
        <TwitterPreview data={node.data} />
      </div>
    </div>
  )
}

export default withT(MetaData)
