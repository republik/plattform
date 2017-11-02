import React from 'react'
import { css } from 'glamor'
import { Map, Set } from 'immutable'

import { Interaction, Label, colors } from '@project-r/styleguide'

import withT from '../../../../lib/withT'
import MetaForm from '../../utils/MetaForm'
import FBPreview from './FBPreview'
import TwitterPreview from './TwitterPreview'

const styles = {
  container: css({
    marginTop: 100,
    backgroundColor: colors.secondaryBg,
    padding: 30
  }),
  center: css({
    maxWidth: 640,
    margin: '0 auto'
  })
}

const getWidth = key => key.match(/title/i) ? '100%' : ''

const MetaData = ({value, editor, additionalFields = [], teaser: Teaser, t}) => {
  const node = value.document

  const genericKeys = Set([
    'publishDate',
    'slug',
    ...additionalFields,
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

  const onInputChange = key => (_, inputValue) => {
    const newData = node.data.remove('auto')
    editor.change(change => {
      change
        .setNodeByKey(node.key, {
          data: inputValue
            ? newData.set(key, inputValue)
            : newData.remove(key)
        })
    })
  }

  return (
    <div {...styles.container}>
      <div {...styles.center}>
        <Interaction.H2>
          {t('metaData/title')}
        </Interaction.H2>
        <br />
        <MetaForm data={genericData} onInputChange={onInputChange} black getWidth={getWidth} />
        <Label>{t('metaData/preview')}</Label><br />
        <Teaser {...node.data.toJS()} />
        <br /><br /><br />
        <MetaForm data={fbData} onInputChange={onInputChange} black getWidth={getWidth} />
        <Label>{t('metaData/preview')}</Label><br />
        <FBPreview data={node.data} />
        <br /><br /><br />
        <MetaForm data={twitterData} onInputChange={onInputChange} black getWidth={getWidth} />
        <Label>{t('metaData/preview')}</Label><br />
        <TwitterPreview data={node.data} />
      </div>
    </div>
  )
}

export default withT(MetaData)
