import { Fragment, useState } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css } from 'glamor'

import ErrorMessage from '../ErrorMessage'
import { getRepoWithPublications } from './Current'
import {
  getRepoHistory,
  COMMIT_LIMIT,
} from '../../pages/repo/[owner]/[repo]/tree'

import { GITHUB_ORG, FRONTEND_BASE_URL } from '../../lib/settings'
import Link from 'next/link'
import { swissTime } from '../../lib/utils/format'

import {
  InlineSpinner,
  Interaction,
  Editorial,
  Label,
  Button,
  Field,
  Checkbox,
  A,
  HR,
  useColorContext,
} from '@project-r/styleguide'

import MaskedInput from 'react-maskedinput'
import { getSchema } from '../Templates'
import useValidation from './useValidation'
import { useRouter } from 'next/router'

const publishMutation = gql`
  mutation publish($repoId: ID!, $commitId: ID!, $settings: PublishSettings!) {
    publish(repoId: $repoId, commitId: $commitId, settings: $settings) {
      unresolvedRepoIds
      publication {
        name
      }
    }
  }
`

const styles = {
  scrollContainer: css({
    padding: '16px 24px 100px 24px',
  }),
  mask: css({
    '::placeholder': {
      color: 'transparent',
    },
    ':focus': {
      '::placeholder': {
        color: '#ccc',
      },
    },
  }),
}

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const scheduledAtFormat = '%d.%m.%Y %H:%M'
const scheduledAtParser = swissTime.parse(scheduledAtFormat)
const scheduledAtFormater = swissTime.format(scheduledAtFormat)

const Form = ({
  t,
  repo,
  commit,
  commit: {
    document: { meta, content },
  },
  publish,
}) => {
  const router = useRouter()
  const hasBeenPublished = !!repo.latestPublications.find(
    (pub) => !pub.prepublication && pub.live,
  )
  const audioSource = repo.commit.document?.meta?.audioSource
  const hasReadAloudAudio =
    !!audioSource?.mp3 && audioSource?.kind === 'readAloud'

  const [state, setCompleteState] = useState({
    prepublication: true,
    skipSynthAudioGeneration: true,
    scheduled: false,
    updateMailchimp: false,
    notifyFilters: [!hasBeenPublished && 'Document'].filter(Boolean),
  })
  const setState = (newState) =>
    setCompleteState((state) => ({ ...state, ...newState }))

  const {
    prepublication,
    updateMailchimp,
    notifyFilters,
    scheduled,
    scheduledAt,
    publishing,
    skipSynthAudioGeneration,
  } = state

  const schema = getSchema(meta.template)

  const { errors, warnings, links } = useValidation({
    meta,
    content,
    t,
    updateMailchimp,
  })
  const [colorScheme] = useColorContext()
  const hasErrors = errors.length > 0

  const scheduledAtDate = scheduledAtParser(scheduledAt)
  const scheduledAtError =
    scheduledAtDate === null && t('publish/label/scheduledAt')

  const designatedPublishDate = repo.meta.publishDate
    ? new Date(repo.meta.publishDate)
    : scheduled
    ? scheduledAtDate
    : new Date()

  return (
    <div {...styles.scrollContainer}>
      <Interaction.H2>{t('publish/title')}</Interaction.H2>
      <br />

      <Interaction.H3>{t('publish/commit/selected')}</Interaction.H3>
      <Interaction.P>{commit.message}</Interaction.P>
      <Label>
        {commit.author.name}
        <br />
        {timeFormat(new Date(commit.date))}
      </Label>
      <Interaction.P>
        <Label>
          <Link href={`/repo/${repo.id}/tree`} passHref legacyBehavior>
            <A>{t('publish/commit/change')}</A>
          </Link>
        </Label>
      </Interaction.P>
      <HR />

      <Interaction.H3>{t('publish/meta/date/label')}</Interaction.H3>
      <Interaction.P>{timeFormat(designatedPublishDate)}</Interaction.P>
      <Label>
        <strong>
          {t('publish/meta/path/label')}
          {': '}
        </strong>
        {FRONTEND_BASE_URL.replace(/https?:\/\/(www\.)?/, '')}
        {content.meta.path ||
          (schema.getPath
            ? schema.getPath({
                ...meta,
                publishDate: designatedPublishDate,
              })
            : `/${meta.slug}`)}
      </Label>
      <HR />

      {hasErrors && (
        <>
          <div
            {...colorScheme.set('backgroundColor', 'error')}
            style={{ padding: 8 }}
          >
            <Label style={{ color: 'white' }}>
              {t('publish/validation/hasErrors')}
            </Label>
            <ul style={{ color: 'white', margin: '0.5em 0' }}>
              {errors.map((error, i) => (
                <li key={i}>
                  <Interaction.P style={{ color: 'white' }}>
                    {error}
                  </Interaction.P>
                </li>
              ))}
            </ul>
          </div>
          <HR />
        </>
      )}
      {warnings.length > 0 && (
        <>
          <div
            {...colorScheme.set('backgroundColor', '#e0aa14')}
            style={{ padding: 8 }}
          >
            <Label style={{ color: 'white' }}>
              {t('publish/validation/hasWarnings')}
            </Label>
            <ul style={{ color: 'white', margin: '0.5em 0' }}>
              {warnings.map((warning, i) => (
                <li key={i}>
                  <Interaction.P style={{ color: 'white' }}>
                    {warning}
                  </Interaction.P>
                </li>
              ))}
            </ul>
          </div>
          <HR />
        </>
      )}
      {links.length > 0 && (
        <>
          <Interaction.P>
            <Editorial.A
              href='#'
              onClick={(e) => {
                e.preventDefault()
                setState({ showLinks: !state.showLinks })
              }}
            >
              {t.pluralize('publish/validation/links', { count: links.length })}
            </Editorial.A>
          </Interaction.P>
          {state.showLinks && (
            <ul>
              {links.map((link, i) => (
                <li key={i}>
                  <Interaction.P
                    {...colorScheme.set(
                      'color',
                      link.errors.length
                        ? 'error'
                        : link.warnings.length
                        ? '#e0aa14'
                        : undefined,
                    )}
                  >
                    {t.elements('publish/validation/link', {
                      text: link.text,
                      link: (
                        <Editorial.A
                          key='link'
                          href={link.url}
                          style={{ wordBreak: 'break-all' }}
                        >
                          {link.url}
                        </Editorial.A>
                      ),
                    })}
                  </Interaction.P>
                </li>
              ))}
            </ul>
          )}
          <br />
          <br />
        </>
      )}

      <Checkbox
        checked={prepublication}
        onChange={(_, value) => {
          setState({
            prepublication: value,
            skipSynthAudioGeneration: meta.template === 'front' || value,
          })
        }}
      >
        {t('publish/label/prepublication')}
      </Checkbox>
      <br />
      <br />
      <Checkbox
        disabled={meta.template === 'front'}
        checked={!skipSynthAudioGeneration}
        onChange={(_, value) => {
          setState({
            skipSynthAudioGeneration: !value,
          })
        }}
      >
        {t('publish/label/generateAudio')}
      </Checkbox>
      <br />
      <br />
      <Checkbox
        disabled={prepublication}
        checked={!prepublication && notifyFilters.includes('Document')}
        onChange={(_, value) => {
          setState({
            notifyFilters: [
              value && 'Document',
              ...notifyFilters.filter((f) => f !== 'Document'),
            ].filter(Boolean),
          })
        }}
      >
        {t.pluralize('publish/label/notifyFiltersDocument', {
          count: commit.document.documentSubscribedBy.totalCount,
        })}
      </Checkbox>
      <br />
      <br />
      <Checkbox
        disabled={prepublication || !hasReadAloudAudio}
        checked={!prepublication && notifyFilters.includes('ReadAloud')}
        onChange={(_, value) => {
          setState({
            notifyFilters: [
              value && 'ReadAloud',
              ...notifyFilters.filter((f) => f !== 'ReadAloud'),
            ].filter(Boolean),
          })
        }}
      >
        {t.pluralize('publish/label/notifyFiltersReadAloud', {
          count: commit.document.readAloudSubscribedBy.totalCount,
        })}
      </Checkbox>
      <br />
      <br />
      {schema.emailTemplate && (
        <div>
          <Checkbox
            checked={updateMailchimp}
            onChange={(_, value) => {
              setState({
                updateMailchimp: value,
              })
            }}
          >
            {t('publish/label/updateMailchimp')}
          </Checkbox>
          <br />
          <br />
        </div>
      )}
      <Checkbox
        checked={scheduled}
        onChange={(_, value) => {
          if (value && !scheduledAt) {
            const now = new Date()
            let nextDate
            if (
              repo.meta.publishDate &&
              new Date(repo.meta.publishDate) > now
            ) {
              nextDate = new Date(repo.meta.publishDate)
            } else {
              nextDate = now
              if (nextDate.getHours() > 4) {
                nextDate.setDate(nextDate.getDate() + 1)
              }
              nextDate.setHours(5)
              nextDate.setMinutes(0)
            }
            setState({
              scheduledAt: scheduledAtFormater(nextDate),
            })
          }

          setState({
            scheduled: value,
          })
        }}
      >
        {t('publish/label/scheduled')}
      </Checkbox>

      {scheduled && (
        <Field
          renderInput={(inputProps) => (
            <MaskedInput
              {...inputProps}
              {...styles.mask}
              placeholderChar={'_'}
              mask={'11.11.1111 11:11'}
            />
          )}
          label={t('publish/label/scheduledAt')}
          value={scheduledAt}
          error={scheduledAtError}
          onChange={(_, value) => {
            setState({
              scheduledAt: value,
            })
          }}
        />
      )}

      <br />
      <br />
      <br />

      {publishing ? (
        <div style={{ textAlign: 'center' }}>
          <InlineSpinner />
        </div>
      ) : (
        <div>
          {!!state.error && <ErrorMessage error={state.error} />}
          {!!state.unresolvedRepoIds && (
            <Fragment>
              <ErrorMessage error={t('publish/error/unresolvedRepoIds')} />
              <ul>
                {state.unresolvedRepoIds.map((repoId) => (
                  <li key={repoId}>
                    <Link href={`/repo/${repoId}/tree`} passHref legacyBehavior>
                      <A>{repoId.replace(`${GITHUB_ORG}/`, '')}</A>
                    </Link>
                  </li>
                ))}
              </ul>
              {updateMailchimp || meta.template === 'editorialNewsletter' ? (
                <ErrorMessage
                  error={t('publish/error/unresolvedRepoIds/template')}
                />
              ) : (
                <Checkbox
                  checked={!!state.ignoreUnresolvedRepoIds}
                  onChange={(_, value) => {
                    setState({
                      ignoreUnresolvedRepoIds: value,
                    })
                  }}
                >
                  {t('publish/error/unresolvedRepoIds/ignore')}
                </Checkbox>
              )}
              <br />
              <br />
            </Fragment>
          )}
          <Button
            block
            primary
            disabled={hasErrors}
            onClick={() => {
              if (scheduled && scheduledAtError) {
                return
              }
              setState({ publishing: true })
              publish({
                repoId: repo.id,
                commitId: commit.id,
                settings: {
                  prepublication,
                  skipSynthAudioGeneration,
                  updateMailchimp,
                  notifyFilters,
                  scheduledAt: scheduled ? scheduledAtDate : undefined,
                  ignoreUnresolvedRepoIds: state.ignoreUnresolvedRepoIds,
                },
              })
                .then(({ data }) => {
                  if (data.publish.publication) {
                    router.push(`/repo/${repo.id}/tree`)
                  } else {
                    setState({
                      publishing: false,
                      ignoreUnresolvedRepoIds: undefined,
                      unresolvedRepoIds: data.publish.unresolvedRepoIds,
                    })
                  }
                })
                .catch((error) => {
                  setState({
                    publishing: false,
                    unresolvedRepoIds: undefined,
                    ignoreUnresolvedRepoIds: undefined,
                    error: error,
                  })
                })
            }}
          >
            {t('publish/trigger')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default compose(
  graphql(publishMutation, {
    props: ({ mutate, ownProps }) => ({
      publish: (variables) =>
        mutate({
          variables,
          refetchQueries: [
            {
              query: getRepoHistory,
              variables: {
                repoId: ownProps.repo?.id,
                first: COMMIT_LIMIT,
              },
            },
            {
              query: getRepoWithPublications,
              variables: {
                repoId: ownProps.repo?.id,
              },
            },
          ],
        }),
    }),
  }),
)(Form)
