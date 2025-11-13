import { Fragment } from 'react'
import { Set, Map } from 'immutable'
import { css } from 'glamor'
import {
  A,
  Label,
  Radio,
  Field,
  Dropdown,
  Interaction,
  IconButton,
} from '@project-r/styleguide'
import { IconAdd, IconArrowUpward, IconArrowDownward, IconHighlightOff } from '@republik/icons'

import AutosizeInput from 'react-textarea-autosize'

import ImageInput from '../../utils/ImageInput'
import MetaForm from '../../utils/MetaForm'
import withT from '../../../../lib/withT'

import RepoSelect from './RepoSelect'
import UIForm from '../../UIForm'

const styles = {
  autoSize: css({
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important',
  }),
  episodeContainer: css({
    margin: '16px 0 16px 0',
    border: '1px solid #DADDDC',
    padding: 12,
  }),
  episodeHeader: css({
    display: 'flex',
    justifyContent: 'space-between',
  }),
  episodeActionBar: css({
    display: 'flex',
  }),
}

export default withT(({ t, editor, node, onRepoInputChange, repoId }) => {
  const coverTextAnchors = [null, 'top', 'middle', 'bottom'].map((value) => ({
    value,
    text: t(`metaData/series/coverText/anchor/${value}`),
  }))

  const value = node.data.get('series')
  const onChange = (key) => (newValue) => {
    editor.change((change) => {
      change.setNodeByKey(node.key, {
        data:
          newValue !== null
            ? node.data.set(key, newValue)
            : node.data.remove(key),
      })
    })
  }
  const onSeriesChange = onChange('series')

  const isEpisode = typeof value === 'string'
  const isMain = !!value && !isEpisode

  const role = (
    <Fragment>
      <Radio
        checked={value === undefined}
        onChange={(event) => {
          event.preventDefault()

          onSeriesChange(undefined)
        }}
      >
        {t('metaData/series/negative')}
      </Radio>{' '}
      &nbsp;{' '}
      <Radio
        checked={isMain}
        onChange={(event) => {
          event.preventDefault()
          onSeriesChange({
            title: '',
            description: '',
            overview: `https://github.com/${repoId}`,
            episodes: [
              {
                label: '',
                title: '',
                lead: '',
                document: null,
              },
            ],
          })
        }}
      >
        {t('metaData/series/main')}
      </Radio>{' '}
      &nbsp;{' '}
      <Radio
        checked={isEpisode}
        onChange={(event) => {
          event.preventDefault()
          onSeriesChange('')
        }}
      >
        {t('metaData/series/episode')}
      </Radio>
    </Fragment>
  )

  const episodes = isMain && value.episodes
  const onEpisodeChange = (episodes) => {
    onSeriesChange({
      ...value,
      episodes: episodes,
    })
  }

  const coverText = node.data.get('coverText')

  return (
    <Fragment>
      <Label>{t('metaData/series/label')}</Label>
      <br />
      {role}
      {(isMain || isEpisode) && (
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
                  color: (coverText && coverText.color) || '#fff',
                },
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
                  color,
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
                  fontSize,
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
                  offset,
                })
              }}
            />
          )}
        </UIForm>
      )}
      {isEpisode && (
        <RepoSelect
          label={t('metaData/series/main')}
          value={value}
          isSeriesMaster={true}
          onChange={onRepoInputChange('series')}
        />
      )}
      {isMain && (
        <div
          style={{
            backgroundColor: '#fff',
            padding: '5px 10px 10px',
            marginTop: 5,
          }}
        >
          <Field
            label={t('metaData/series/title/label')}
            value={value.title}
            onChange={(_, title) => {
              onSeriesChange({
                ...value,
                title,
              })
            }}
          />
          <Field
            label={t('metaData/series/description')}
            autoSize={true}
            renderInput={({ ref, ...inputProps }) => (
              <AutosizeInput
                {...styles.autoSize}
                {...inputProps}
                inputRef={ref}
              />
            )}
            value={value.description}
            onChange={(_, description) => {
              onSeriesChange({
                ...value,
                description,
              })
            }}
          />
          <RepoSelect
            label={t('metaData/series/overview')}
            value={value.overview}
            isSeriesMaster={true}
            onChange={(_, overview) => {
              onSeriesChange({
                ...value,
                overview,
              })
            }}
          />
          <Label style={{ display: 'block', marginTop: -5, marginBottom: 10 }}>
            {t('metaData/series/overview/note')}
          </Label>
          <div style={{ float: 'left', marginRight: 15 }}>
            <ImageInput
              label='Logo'
              maxWidth={100}
              src={value.logo}
              onChange={(_, logo) => {
                onSeriesChange({
                  ...value,
                  logo,
                })
              }}
              repoId={repoId}
            />
          </div>
          <div style={{ float: 'left' }}>
            <ImageInput
              label='Logo Nachtmodus'
              maxWidth={100}
              dark
              src={value.logoDark}
              onChange={(_, logoDark) => {
                onSeriesChange({
                  ...value,
                  logoDark,
                })
              }}
              repoId={repoId}
            />
          </div>
          <br style={{ clear: 'both' }} />
          <br />
          <Interaction.H2>Episoden</Interaction.H2>
          <br />
          <IconButton
            Icon={IconAdd}
            label={t('metaData/series/episodes/add')}
            onClick={() => {
              onEpisodeChange(
                [
                  {
                    label: '',
                    title: '',
                    lead: '',
                    document: null,
                  },
                ].concat(episodes),
              )
            }}
          />
          {episodes.map((episode, i) => {
            // omit publishDate, no longer used
            const { document: episodeDoc, publishDate: _, ...values } = episode
            const keys = Set(['title', 'lead', 'label', 'image'])
            const defaultValues = Map(keys.map((key) => [key, '']))

            const onEpisodeFieldsChange = (newData) => {
              onEpisodeChange(
                episodes
                  .slice(0, i)
                  .concat({
                    ...episode,
                    ...newData,
                  })
                  .concat(episodes.slice(i + 1)),
              )
            }
            const onEpisodeFieldChange = (key) => (_, keyValue) => {
              onEpisodeFieldsChange({
                [key]: keyValue,
              })
            }
            return (
              <div {...styles.episodeContainer} key={`episode-${i}`}>
                <div {...styles.episodeHeader}>
                  <Interaction.H3>
                    {`${t('metaData/series/episodes/label')} ${i + 1}`}
                  </Interaction.H3>
                  <div {...styles.episodeActionBar}>
                    {i !== 0 && (
                      <IconButton
                        Icon={IconArrowUpward}
                        size={24}
                        label={t('metaData/series/episodes/up')}
                        onClick={() => {
                          onEpisodeChange(
                            episodes
                              .slice(0, i - 1)
                              .concat(episode)
                              .concat(episodes.slice(i - 1, i))
                              .concat(episodes.slice(i + 1)),
                          )
                        }}
                      />
                    )}
                    {i !== episodes.length - 1 && (
                      <IconButton
                        size={24}
                        Icon={IconArrowDownward}
                        label={t('metaData/series/episodes/down')}
                        onClick={() => {
                          onEpisodeChange(
                            episodes
                              .slice(0, i)
                              .concat(episodes.slice(i + 1, i + 2))
                              .concat(episode)
                              .concat(episodes.slice(i + 2)),
                          )
                        }}
                      />
                    )}
                    <IconButton
                      Icon={IconHighlightOff}
                      label={t('metaData/series/episodes/rm')}
                      size={24}
                      onClick={() => {
                        onEpisodeChange(
                          episodes.slice(0, i).concat(episodes.slice(i + 1)),
                        )
                      }}
                    />
                  </div>
                </div>
                <RepoSelect
                  label={t('metaData/series/episodes/document')}
                  value={episodeDoc}
                  isSeriesEpisode={true}
                  onChange={(_, url, item) => {
                    const newData = {
                      document: url,
                    }
                    const meta = item?.value?.latestCommit?.document?.meta
                    if (meta) {
                      if (!values.title) {
                        newData.title = meta.title
                      }
                      if (!values.lead) {
                        newData.lead = meta.description
                      }
                    }
                    onEpisodeFieldsChange(newData)
                  }}
                />
                <MetaForm
                  data={defaultValues.merge(values)}
                  onInputChange={onEpisodeFieldChange}
                  getWidth={() => '50%'}
                />
              </div>
            )
          })}
          <IconButton
            Icon={IconAdd}
            size={24}
            label={t('metaData/series/episodes/add')}
            onClick={() => {
              onEpisodeChange(
                episodes.concat({
                  label: '',
                  title: '',
                  lead: '',
                  document: null,
                }),
              )
            }}
          />
        </div>
      )}
      <br />
      <br />
    </Fragment>
  )
})
