import React from 'react'
import { css } from 'glamor'
import { Map, Set } from 'immutable'
import { nest } from 'd3-collection'

import { Interaction, Checkbox, Label, colors } from '@project-r/styleguide'

import withT from '../../../../lib/withT'
import slugify from '../../../../lib/utils/slug'
import { FRONTEND_BASE_URL } from '../../../../lib/settings'

import MetaForm from '../../utils/MetaForm'
import SlugField from '../../utils/SlugField'
import TwitterPreview from './TwitterPreview'
import RepoSelect from './RepoSelect'
import SeriesForm from './SeriesForm'
import PaynotesForm from './PaynotesForm'
import AudioForm from './AudioForm'
import UIForm from '../../UIForm'
import DarkModeForm, { DARK_MODE_KEY } from './DarkModeForm'
import ShareImageForm from './ShareImageForm'

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

export const getWidth = key =>
  key.match(/title|feed|emailSubject/i) ? '100%' : ''

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

  const fbKeys = Set(['facebookTitle', 'facebookDescription'])
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
    const newData = key !== 'auto' ? node.data.remove('auto') : node.data
    editor.change(change => {
      change.setNodeByKey(node.key, {
        data:
          inputValue || inputValue === false
            ? newData.set(key, inputValue)
            : newData.remove(key)
      })
    })
  }
  const onRepoInputChange = key => (_, __, item) => {
    editor.change(change => {
      change.setNodeByKey(node.key, {
        data: item
          ? node.data.set(key, `https://github.com/${item.value.id}`)
          : node.data.remove(key)
      })
      const titleNode = change.value.document.findDescendant(
        node => node.type === 'TITLE'
      )
      if (titleNode) {
        let data = item ? item.value.latestCommit.document : undefined
        if (key === 'series' && data) {
          data = data.meta.series
        }
        const newData = {
          ...titleNode.data.toJS(),
          [key]: data
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
  const titleNode = value.document.findDescendant(node => node.type === 'TITLE')
  const titleData = titleNode ? titleNode.data.toJS() : {}

  console.log(titleData.format)

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
            const rootDocDataKeys = ['format', 'section']

            return (
              <RepoSelect
                key={customField.key}
                label={label}
                value={value}
                template={customField.key}
                onChange={
                  rootDocDataKeys.includes(customField.key)
                    ? onRepoInputChange(customField.key)
                    : onInputChange(customField.key)
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
        {!!series && (
          <SeriesForm
            editor={editor}
            node={node}
            onRepoInputChange={onRepoInputChange}
          />
        )}
        {!!Teaser && (
          <div>
            <Label>{t('metaData/preview')}</Label>
            <br />
            <Teaser
              {...dataAsJs}
              repoId={titleData.repoId}
              section={titleData.section}
              format={titleData.format}
              series={titleData.series}
              credits={undefined}
            />
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
          getWidth={getWidth}
        />
        <Label>{t('metaData/preview')}</Label>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <ShareImageForm
          onInputChange={onInputChange}
          mediumKey='facebook'
          data={node.data}
          format={titleData?.format}
        />
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
