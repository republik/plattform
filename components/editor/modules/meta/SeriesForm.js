import React, { Fragment } from 'react'
import { Set, Map } from 'immutable'

import { A, Label, Radio, Field, Dropdown } from '@project-r/styleguide'

import MetaForm from '../../utils/MetaForm'
import withT from '../../../../lib/withT'

import RepoSelect from './RepoSelect'
import UIForm from '../../UIForm'

export default withT(({ t, editor, node, onInputChange }) => {
  const coverTextAnchors = [null, 'top', 'middle', 'bottom'].map(value => ({
    value,
    text: t(`metaData/series/coverText/anchor/${value}`)
  }))

  const value = node.data.get('series')
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
  const onSeriesChange = onChange('series')

  const isEpisode = typeof value === 'string'
  const isMaster = !!value && !isEpisode

  const role = (
    <Fragment>
      <Radio
        checked={value === undefined}
        onChange={event => {
          event.preventDefault()

          onSeriesChange(undefined)
        }}
      >
        {t('metaData/series/negative')}
      </Radio>{' '}
      &nbsp;{' '}
      <Radio
        checked={isMaster}
        onChange={event => {
          event.preventDefault()
          onSeriesChange({
            title: '',
            episodes: [{ title: '', publishDate: '', document: null }]
          })
        }}
      >
        {t('metaData/series/master')}
      </Radio>{' '}
      &nbsp;{' '}
      <Radio
        checked={isEpisode}
        onChange={event => {
          event.preventDefault()
          onSeriesChange('')
        }}
      >
        {t('metaData/series/episode')}
      </Radio>
    </Fragment>
  )

  const episodes = isMaster && value.episodes
  const onEpisodeChange = episodes => {
    onSeriesChange({
      ...value,
      episodes: episodes
    })
  }

  const coverText = node.data.get('coverText')

  return (
    <Fragment>
      <Label>{t('metaData/series/label')}</Label>
      <br />
      {role}
      {(isMaster || isEpisode) && (
        <UIForm getWidth={() => '25%'}>
          <Dropdown
            black
            label={t('metaData/series/coverText/anchor')}
            items={coverTextAnchors}
            value={coverText ? coverText.anchor : null}
            onChange={({ value }) =>
              onChange('coverText')(
                value && {
                  anchor: value,
                  offset:
                    value === 'middle'
                      ? ''
                      : (coverText && coverText.offset) || '5%',
                  color: (coverText && coverText.color) || '#fff'
                }
              )
            }
          />
          {coverText && (
            <Field
              black
              label={t('metaData/series/coverText/color')}
              value={coverText.color}
              onChange={(_, color) => {
                onChange('coverText')({
                  ...coverText,
                  color
                })
              }}
            />
          )}
          {coverText && (
            <Field
              black
              label={t('metaData/series/coverText/fontSize')}
              value={coverText.fontSize}
              onChange={(_, fontSize) => {
                onChange('coverText')({
                  ...coverText,
                  fontSize
                })
              }}
            />
          )}
          {coverText && (
            <Field
              black
              label={t('metaData/series/coverText/offset')}
              value={coverText.offset}
              onChange={(_, offset) => {
                onChange('coverText')({
                  ...coverText,
                  offset
                })
              }}
            />
          )}
        </UIForm>
      )}
      {isEpisode && (
        <RepoSelect
          label={t('metaData/series/master')}
          value={value}
          onChange={(_, url) => {
            onSeriesChange(url || '')
          }}
        />
      )}
      {isMaster && (
        <div
          style={{
            backgroundColor: '#fff',
            padding: '5px 10px 10px',
            marginTop: 5
          }}
        >
          <Field
            label={t('metaData/series/title/label')}
            value={value.title}
            onChange={(_, title) => {
              onSeriesChange({
                ...value,
                title: title
              })
            }}
          />
          {episodes.map((episode, i) => {
            const { document: episodeDoc, ...values } = episode
            const keys = Set(['label', 'title', 'image', 'publishDate'])
            const defaultValues = Map(keys.map(key => [key, '']))

            const onEpisodeFieldChange = key => (_, keyValue) => {
              onEpisodeChange(
                episodes
                  .slice(0, i)
                  .concat({
                    ...episode,
                    [key]: keyValue
                  })
                  .concat(episodes.slice(i + 1))
              )
            }
            return (
              <Fragment key={episode.title}>
                <Label>{t('metaData/series/episodes/label')}</Label> &nbsp;{' '}
                <A
                  href='#remove'
                  onClick={e => {
                    e.preventDefault()
                    onEpisodeChange(
                      episodes.slice(0, i).concat(episodes.slice(i + 1))
                    )
                  }}
                >
                  {t('metaData/series/episodes/rm')}
                </A>
                <br />
                <MetaForm
                  data={defaultValues.merge(values)}
                  onInputChange={onEpisodeFieldChange}
                  getWidth={() => '50%'}
                />
                <RepoSelect
                  label={t('metaData/series/episodes/document')}
                  value={episodeDoc}
                  onChange={(_, url) => {
                    onEpisodeFieldChange('document')(undefined, url)
                  }}
                />
              </Fragment>
            )
          })}
          <A
            href='#remove'
            onClick={e => {
              e.preventDefault()
              onEpisodeChange(
                episodes.concat({
                  title: '',
                  publishDate: '',
                  document: null
                })
              )
            }}
          >
            {t('metaData/series/episodes/add')}
          </A>
        </div>
      )}
      <br />
      <br />
    </Fragment>
  )
})
