import React from 'react'
import { css } from 'glamor'
import { Map, Set } from 'immutable'
import { nest } from 'd3-collection'

import {
  A,
  Interaction,
  Dropdown,
  Field,
  Checkbox,
  Label,
  colors
} from '@project-r/styleguide'

import withT from '../../../../lib/withT'
import slugify from '../../../../lib/utils/slug'
import { FRONTEND_BASE_URL } from '../../../../lib/settings'

import MetaForm from '../../utils/MetaForm'
import SlugField from '../../utils/SlugField'
import FBPreview from './FBPreview'
import TwitterPreview from './TwitterPreview'
import RepoSelect from './RepoSelect'
import SeriesForm from './SeriesForm'
import PaynotesForm from './PaynotesForm'
import AudioForm from './AudioForm'
import UIForm from '../../UIForm'
import DarkModeForm, { DARK_MODE_KEY } from './DarkModeForm'

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
  isTemplate,
  series,
  darkMode,
  paynotes,
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

  const customFieldsRest = customFields.filter(f => !f.ref)

  return (
    <div {...styles.container}>
      <div {...styles.center}>
        <Interaction.H2>{t('metaData/title')}</Interaction.H2>
        <div style={{ marginTop: 6 }}>
          <Checkbox
            checked={node.data.get('auto')}
            onChange={onInputChange('auto')}
            black
          >
            {t('metaData/field/auto')}
          </Checkbox>
        </div>
        <br />
        <SlugField
          black
          label={t(
            `metaData/field/${isTemplate ? 'repoSlug' : 'slug'}`,
            undefined,
            'slug'
          )}
          value={node.data.get('slug')}
          onChange={onInputChange('slug')}
          isTemplate={isTemplate}
        />
        {!isTemplate && mdastSchema && mdastSchema.getPath && (
          <Label>
            {t('metaData/field/slug/note', {
              base: FRONTEND_BASE_URL
                ? FRONTEND_BASE_URL.replace(/https?:\/\/(www\.)?/, '')
                : '',
              path: mdastSchema.getPath({
                ...dataAsJs,
                publishDate: contextMeta.publishDate
                  ? new Date(contextMeta.publishDate)
                  : new Date(),
                slug: slugify(dataAsJs.slug || '')
              })
            })}
            <br />
            {!!dataAsJs.path && (
              <>
                {t('metaData/field/slug/pathNote', {
                  base: FRONTEND_BASE_URL.replace(/https?:\/\/(www\.)?/, ''),
                  path: dataAsJs.path
                })}
                <br />
              </>
            )}
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
        <br />
        <UIForm getWidth={() => '50%'}>
          {(customFieldsByRef['repo'] || []).map(customField => {
            const label =
              customField.label ||
              t(`metaData/field/${customField.key}`, undefined, customField.key)
            const value = node.data.get(customField.key)
            const onChange = onInputChange(customField.key)
            const rootDocDataKeys = ['format', 'section']

            return (
              <RepoSelect
                key={customField.key}
                label={label}
                value={value}
                template={customField.key}
                onChange={
                  rootDocDataKeys.includes(customField.key)
                    ? (_, __, item) => {
                        editor.change(change => {
                          change.setNodeByKey(node.key, {
                            data: item
                              ? node.data.set(
                                  customField.key,
                                  `https://github.com/${item.value.id}`
                                )
                              : node.data.remove(customField.key)
                          })
                          let titleNode = change.value.document.findDescendant(
                            node => node.type === 'TITLE'
                          )
                          if (titleNode) {
                            const doc = item
                              ? item.value.latestCommit.document
                              : undefined
                            const newData = {
                              ...titleNode.data.toJS(),
                              [customField.key]: doc
                            }
                            change.setNodeByKey(titleNode.key, {
                              data: newData
                            })
                            titleNode.nodes.forEach(node => {
                              change.setNodeByKey(node.key, {
                                data: newData
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
        </UIForm>
        <MetaForm
          customFields={customFieldsRest}
          data={Map(
            customFieldsRest.map(field => [field.key, node.data.get(field.key)])
          )}
          onInputChange={onInputChange}
          black
          getWidth={() => '50%'}
        />
        {!!series && <SeriesForm editor={editor} node={node} />}
        {!!Teaser && (
          <div>
            <Label>{t('metaData/preview')}</Label>
            <br />
            <Teaser {...dataAsJs} credits={undefined} />
          </div>
        )}
        {!!darkMode && (
          <DarkModeForm
            data={node.data}
            onChange={onInputChange(DARK_MODE_KEY)}
          />
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
        {!!paynotes && <PaynotesForm editor={editor} node={node} />}
        <br />
        <br />
        <br />
      </div>
    </div>
  )
}

export default withT(MetaData)
