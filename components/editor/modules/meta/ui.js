import React from 'react'
import { css } from 'glamor'
import { Map, Set } from 'immutable'
import { nest } from 'd3-collection'

import {
  Interaction,
  Dropdown,
  Field,
  Checkbox,
  Label,
  colors
} from '@project-r/styleguide'

import withT from '../../../../lib/withT'
import slugify from '../../../../lib/utils/slug'

import MetaForm from '../../utils/MetaForm'
import SlugField from '../../utils/SlugField'
import FBPreview from './FBPreview'
import TwitterPreview from './TwitterPreview'
import RepoSelect from './RepoSelect'
import SeriesForm from './SeriesForm'
import AudioForm from './AudioForm'
import UIForm from '../../UIForm'

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
  bool: css({
    clear: 'left',
    margin: '10px 0'
  })
}

const getWidth = key => (key.match(/title|feed|emailSubject/i) ? '100%' : '')

const MetaData = ({
  value,
  editor,
  mdastSchema,
  contextMeta,
  series,
  additionalFields = [],
  customFields = [],
  teaser: Teaser,
  t
}) => {
  const node = value.document

  const genericKeys = Set([
    'feed',
    ...additionalFields,
    'title',
    'shortTitle',
    'image',
    'description'
  ])
  const genericDefaultValues = Map(
    genericKeys.map(key => [key, key === 'feed' ? false : ''])
  )
  const genericData = genericDefaultValues.merge(
    node.data.filter((_, key) => genericKeys.has(key))
  )

  const fbKeys = Set(['facebookTitle', 'facebookImage', 'facebookDescription'])
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
      change.setNodeByKey(node.key, {
        data:
          inputValue || inputValue === false
            ? newData.set(key, inputValue)
            : newData.remove(key)
      })
    })
  }

  const dataAsJs = node.data.toJS()
  const customFieldsByRef = nest()
    .key(d => (d ? d.ref : 'field'))
    .object(customFields)

  return (
    <div {...styles.container}>
      <div {...styles.center}>
        <Interaction.H2>{t('metaData/title')}</Interaction.H2>
        <br />
        <SlugField
          black
          label={t(`metaData/field/slug`, undefined, 'slug')}
          value={node.data.get('slug')}
          onChange={onInputChange('slug')}
        />
        {mdastSchema && mdastSchema.getPath && (
          <Label>
            {t('metaData/field/slug/note', {
              path: mdastSchema.getPath({
                ...dataAsJs,
                publishDate: contextMeta.publishDate
                  ? new Date(contextMeta.publishDate)
                  : new Date(),
                slug: slugify(dataAsJs.slug || '')
              })
            })}
            <br />
            <br />
          </Label>
        )}
        <MetaForm
          data={genericData}
          onInputChange={onInputChange}
          black
          getWidth={getWidth}
        />
        {(customFieldsByRef['bool'] || []).map(customField => {
          return (
            <div key={customField.key} {...styles.bool}>
              <Checkbox
                checked={node.data.get(customField.key)}
                onChange={onInputChange(customField.key)}
              >
                {customField.label}
              </Checkbox>
            </div>
          )
        })}
        <UIForm getWidth={() => '50%'}>
          {(customFieldsByRef['repo'] || []).map(customField => {
            const label =
              customField.label ||
              t(`metaData/field/${customField.key}`, undefined, customField.key)
            const value = node.data.get(customField.key)
            const onChange = onInputChange(customField.key)
            return (
              <RepoSelect
                key={customField.key}
                label={label}
                value={value}
                template={customField.key}
                onChange={
                  customField.key === 'format'
                    ? (_, __, item) => {
                        editor.change(change => {
                          change.setNodeByKey(node.key, {
                            data: item
                              ? node.data.set(
                                  'format',
                                  `https://github.com/${item.value.id}`
                                )
                              : node.data.remove('format')
                          })
                          let titleNode = change.value.document.findDescendant(
                            node => node.type === 'TITLE'
                          )
                          if (titleNode) {
                            const format = item
                              ? item.value.latestCommit.document
                              : undefined
                            change.setNodeByKey(titleNode.key, {
                              data: { format }
                            })
                            titleNode.nodes.forEach(node => {
                              change.setNodeByKey(node.key, {
                                data: { format }
                              })
                            })
                          }
                        })
                      }
                    : onChange
                }
              />
            )
          })}
          {customFields.map(customField => {
            const label =
              customField.label ||
              t(`metaData/field/${customField.key}`, undefined, customField.key)
            const value = node.data.get(customField.key)
            const onChange = onInputChange(customField.key)
            if (customField.items) {
              return (
                <Dropdown
                  key={customField.key}
                  black
                  items={customField.items}
                  label={label}
                  value={value}
                  onChange={item => onChange(undefined, item.value)}
                />
              )
            }

            if (!customField.ref) {
              return (
                <Field
                  key={customField.key}
                  black
                  label={label}
                  value={value}
                  onChange={onChange}
                />
              )
            }
          })}
        </UIForm>
        {!!series && <SeriesForm editor={editor} node={node} />}
        {!!Teaser && (
          <div>
            <Label>{t('metaData/preview')}</Label>
            <br />
            <Teaser {...dataAsJs} credits={undefined} />
          </div>
        )}
        <br />
        <br />
        <br />
        <MetaForm
          data={fbData}
          onInputChange={onInputChange}
          black
          getWidth={getWidth}
        />
        <Label>{t('metaData/preview')}</Label>
        <br />
        <FBPreview data={node.data} />
        <br />
        <br />
        <br />
        <MetaForm
          data={twitterData}
          onInputChange={onInputChange}
          black
          getWidth={getWidth}
        />
        <Label>{t('metaData/preview')}</Label>
        <br />
        <TwitterPreview data={node.data} />
        <br />
        <br />
        <br />
        <AudioForm editor={editor} node={node} onInputChange={onInputChange} />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </div>
    </div>
  )
}

export default withT(MetaData)
