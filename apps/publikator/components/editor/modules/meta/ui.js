import { css } from 'glamor'
import { Map, Set } from 'immutable'
import { nest } from 'd3-collection'

import {
  Interaction,
  Checkbox,
  Label,
  colors,
  slug,
} from '@project-r/styleguide'
import withT from '../../../../lib/withT'

import MetaForm from '../../utils/MetaForm'
import SlugField from '../../utils/SlugField'
import RepoSelect from './RepoSelect'
import SeriesForm from './SeriesForm'
import AudioForm from './AudioForm'
import UIForm from '../../UIForm'
import ShareImageForm from './ShareImageForm'
import GooglePreview from './GooglePreview'
import ArticleRecommendations from './ArticleRecommendations/ArticleRecommendations'
import PublishPathNotice from './PublishPathNotice'
import {
  MetaOptionGroup,
  MetaOptionGroupTitle,
  MetaSection,
  MetaSectionTitle,
} from '../../../MetaDataForm/components/Layout'
import TextToSpeechForm from './TextToSpeechForm'

const styles = {
  container: css({
    marginTop: 100,
    backgroundColor: colors.secondaryBg,
    padding: 30,
    '@media print': {
      display: 'none',
    },
  }),
  center: css({
    maxWidth: 640,
    margin: '0 auto',
  }),
  bool: css({
    clear: 'left',
    margin: '10px 0',
  }),
}

export const getWidth = (key) =>
  key.match(/title|feed|emailSubject/i) ? '100%' : ''

const MetaData = ({
  value,
  editor,
  mdastSchema,
  contextMeta,
  isTemplate,
  series,
  darkMode,
  additionalFields = [],
  customFields = [],
  teaser: Teaser,
  t,
}) => {
  const node = value.document

  const titleNode = value.document.findDescendant(
    (node) => node.type === 'TITLE',
  )
  const titleData = titleNode ? titleNode.data.toJS() : {}
  const formatData = titleData?.format?.meta

  const genericKeys = Set(
    [
      'feed',
      ...additionalFields,
      formatData?.sendAsEmail && 'emailSubject',
      'title',
      'shortTitle',
      'image',
      'description',
    ].filter(Boolean),
  )
  const genericDefaultValues = Map(
    genericKeys.map((key) => [key, key === 'feed' ? false : '']),
  )
  const genericData = genericDefaultValues.merge(
    node.data.filter((_, key) => genericKeys.has(key)),
  )

  const seoKeys = Set(['seoTitle', 'seoDescription'])
  const seoDefaultValues = Map(seoKeys.map((key) => [key, '']))
  const seoData = seoDefaultValues.merge(
    node.data.filter((_, key) => seoKeys.has(key)),
  )

  const onInputChange = (key) => (_, inputValue) => {
    let newData = node.data
    if (key === 'title' || key === 'description') {
      newData = newData.remove('auto')
    }
    if (key === 'slug') {
      newData = newData.remove('autoSlug')
    }
    editor.change((change) => {
      change.setNodeByKey(node.key, {
        data:
          inputValue || inputValue === false
            ? newData.set(key, inputValue)
            : newData.remove(key),
      })
    })
  }
  const onRepoInputChange = (key) => (_, __, item) => {
    editor.change((change) => {
      change.setNodeByKey(node.key, {
        data: item
          ? node.data.set(key, `https://github.com/${item.value.id}`)
          : key === 'format'
          ? node.data.remove(key).remove('emailSubject')
          : node.data.remove(key),
      })
      let data = item ? item.value.latestCommit.document : undefined
      if (key === 'series' && data) {
        data = data.meta.series

        const seriesNavNodes = change.value.document.filterDescendants(
          (node) => node.type === 'SERIES_NAV',
        )
        seriesNavNodes.forEach((node) => {
          change.setNodeByKey(node.key, {
            data: node.data.set('series', data),
          })
        })
      }

      const titleNode = change.value.document.findDescendant(
        (node) => node.type === 'TITLE',
      )
      if (titleNode) {
        const newData = {
          ...titleNode.data.toJS(),
          [key]: data,
        }
        change.setNodeByKey(titleNode.key, {
          data: newData,
        })
        titleNode.nodes.forEach((node) => {
          change.setNodeByKey(node.key, {
            data: newData,
          })
        })
      }
    })
  }

  const dataAsJs = node.data.toJS()
  const customFieldsByRef = nest()
    .key((d) => (d ? d.ref : 'field'))
    .object(customFields)

  const customFieldsRest = customFields.filter((f) => !f.ref)

  const previewPublishDate = contextMeta.publishDate
    ? new Date(contextMeta.publishDate)
    : new Date()
  const previewPath = mdastSchema.getPath({
    ...dataAsJs,
    publishDate: previewPublishDate,
    slug: slug(dataAsJs.slug || ''),
  })

  const slugFieldElement = (
    <>
      <SlugField
        black
        label={t(
          `metaData/field/${isTemplate ? 'repoSlug' : 'slug'}`,
          undefined,
          'slug',
        )}
        value={node.data.get('slug')}
        onChange={onInputChange('slug')}
        isTemplate={isTemplate}
        icon={
          <span style={{ display: 'inline-block', paddingTop: 10 }}>
            <Checkbox
              checked={node.data.get('autoSlug')}
              onChange={onInputChange('autoSlug')}
              black
            >
              <span style={{ verticalAlign: 'top' }}>automatisch</span>
            </Checkbox>
          </span>
        }
      />
      <br />
      {!isTemplate && mdastSchema && mdastSchema.getPath && (
        <PublishPathNotice previewPath={previewPath} meta={dataAsJs} />
      )}
    </>
  )

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
        <MetaForm
          data={genericData}
          onInputChange={onInputChange}
          black
          getWidth={getWidth}
        />
        <br />
        {slugFieldElement}
        {[
          ...(customFieldsByRef['bool'] || []),
          darkMode && {
            key: 'darkMode',
            label: t('metaData/darkMode'),
          },
        ]
          .filter(Boolean)
          .map((customField) => {
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
          {(customFieldsByRef['repo'] || []).map((customField) => {
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
            customFieldsRest.map((field) => [
              field.key,
              node.data.get(field.key),
            ]),
          )}
          onInputChange={onInputChange}
          black
          getWidth={() => '50%'}
        />
        {!!series && (
          <SeriesForm
            repoId={titleData.repoId}
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

        <MetaSection>
          <MetaSectionTitle>Social</MetaSectionTitle>
          <ShareImageForm
            onInputChange={onInputChange}
            format={formatData}
            editor={editor}
            node={node}
          />
          <MetaOptionGroupTitle>SEO</MetaOptionGroupTitle>
          <MetaOptionGroup>
            <MetaForm data={seoData} onInputChange={onInputChange} black />
            {slugFieldElement}
            <GooglePreview
              title={
                node.data.get('seoTitle') ||
                node.data.get('twitterTitle') ||
                node.data.get('title')
              }
              description={
                node.data.get('seoDescription') ||
                node.data.get('twitterDescription') ||
                node.data.get('description')
              }
              publishDate={previewPublishDate}
              path={dataAsJs.path || previewPath}
            />
          </MetaOptionGroup>
        </MetaSection>
        <TextToSpeechForm
          editor={editor}
          node={node}
          onInputChange={onInputChange}
        />
        <AudioForm
          editor={editor}
          node={node}
          onInputChange={onInputChange}
          format={titleData?.format?.meta}
        />
        <ArticleRecommendations editor={editor} node={node} />
      </div>
    </div>
  )
}

export default withT(MetaData)
