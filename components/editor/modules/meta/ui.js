import React from 'react'
import { css } from 'glamor'
import { Map, Set } from 'immutable'

import { Interaction, Dropdown, Field, Label, colors } from '@project-r/styleguide'

import withT from '../../../../lib/withT'
import MetaForm from '../../utils/MetaForm'
import FBPreview from './FBPreview'
import TwitterPreview from './TwitterPreview'
import SidebarForm from '../../SidebarForm'

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

const getWidth = key => key.match(/title|feed|emailSubject/i) ? '100%' : ''

const MetaData = ({value, editor, additionalFields = [], customFields = [], teaser: Teaser, t}) => {
  const node = value.document

  const genericKeys = Set([
    'publishDate',
    'slug',
    'feed',
    ...additionalFields,
    'title',
    'image',
    'description'
  ])
  const genericDefaultValues = Map(genericKeys.map(key => [
    key,
    key === 'feed' ? false : ''
  ]))
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
          data: inputValue || inputValue === false
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
        <SidebarForm getWidth={() => '50%'}>
          {customFields.map(customField => {
            const label = customField.label || t(`metaData/field/${customField.key}`, undefined, customField.key)
            const value = node.data.get(customField.key)
            const onChange = onInputChange(customField.key)
            if (customField.items) {
              return <Dropdown key={customField.key}
                black
                items={customField.items}
                label={label}
                value={value}
                onChange={item => onChange(undefined, item.value)} />
            }
            return <Field key={customField.key}
              black
              label={label}
              value={value}
              onChange={onChange} />
          })}
        </SidebarForm>
        {!!Teaser && (<div>
          <Label>{t('metaData/preview')}</Label><br />
          <Teaser {...node.data.toJS()} />
        </div>)}
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
