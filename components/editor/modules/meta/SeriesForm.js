import React, { Fragment } from 'react'
import { Set, Map } from 'immutable'

import { A, Label, Radio, Field } from '@project-r/styleguide'

import MetaForm from '../../utils/MetaForm'
import withT from '../../../../lib/withT'

import RepoSelect from './RepoSelect'

const romanize = (num) => {
  if (!+num) return NaN
  let digits = String(+num).split('')
  const key = [
    '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
  ]
  let roman = ''
  let i = 3
  while (i--) {
    roman = (key[+digits.pop() + (i * 10)] || '') + roman
  }
  return Array(+digits.join('') + 1).join('M') + roman
}

export default withT(({ t, editor, node, onInputChange }) => {
  const value = node.data.get('series')
  const onChange = series => {
    editor.change(change => {
      change
        .setNodeByKey(node.key, {
          data: series !== null
            ? node.data.set('series', series)
            : node.data.remove('series')
        })
    })
  }

  const isEpisode = typeof value === 'string'
  const isMaster = !!value && !isEpisode

  const role = (
    <Fragment>
      <Radio
        checked={value === undefined}
        onChange={event => {
          event.preventDefault()

          onChange(undefined)
        }}
      >
        {t('metaData/series/negative')}
      </Radio>
      {' '}&nbsp;{' '}
      <Radio
        checked={isMaster}
        onChange={event => {
          event.preventDefault()
          onChange({
            title: '',
            episodes: [
              {title: '', publishDate: '', document: null}
            ]
          })
        }}
      >
        {t('metaData/series/master')}
      </Radio>
      {' '}&nbsp;{' '}
      <Radio
        checked={isEpisode}
        onChange={event => {
          event.preventDefault()
          onChange('')
        }}
      >
        {t('metaData/series/episode')}
      </Radio>
    </Fragment>
  )

  const episodes = isMaster && value.episodes
  const onEpisodeChange = episodes => {
    onChange({
      ...value,
      episodes: episodes
    })
  }

  return <Fragment>
    <Label>{t('metaData/series/label')}</Label><br />
    {role}
    {isEpisode && <RepoSelect label={t('metaData/series/master')} value={value} onChange={(_, url) => {
      onChange(url || '')
    }} />}
    {isMaster && (
      <div style={{backgroundColor: '#fff', padding: '5px 10px 10px', marginTop: 5}}>
        <Field
          label={'Title'}
          value={value.title}
          onChange={(_, title) => {
            onChange({
              ...value,
              title: title
            })
          }} />
        {episodes.map((episode, i) => {
          const {document: episodeDoc, ...values} = episode
          const keys = Set([
            'title',
            'publishDate'
          ])
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
            <Fragment>
              <Label>{t('metaData/series/episodes/label', {
                roman: romanize(i + 1),
                count: i + 1
              })}</Label>
              {' '}&nbsp;{' '}
              <A href='#remove' onClick={(e) => {
                e.preventDefault()
                onEpisodeChange(episodes
                  .slice(0, i)
                  .concat(episodes.slice(i + 1)))
              }}>{t('metaData/series/episodes/rm')}</A>
              <br />
              <MetaForm data={defaultValues.merge(values)} onInputChange={onEpisodeFieldChange} getWidth={() => '50%'} />
              <RepoSelect label={t('metaData/series/episodes/document')} value={episodeDoc} onChange={(_, url) => {
                onEpisodeFieldChange('document')(undefined, url)
              }} />
            </Fragment>
          )
        })}
        <A href='#remove' onClick={(e) => {
          e.preventDefault()
          onEpisodeChange(episodes.concat({
            title: '',
            publishDate: '',
            document: null
          }))
        }}>{t('metaData/series/episodes/add')}</A>
      </div>
    )}
    <br />
    <br />
  </Fragment>
})
