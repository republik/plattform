import React, { Fragment, useState } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { css } from 'glamor'

import ErrorMessage from '../ErrorMessage'
import IFrame from '../IFrame'

import { GITHUB_ORG, FRONTEND_BASE_URL } from '../../lib/settings'
import { intersperse } from '../../lib/utils/helpers'
import withT from '../../lib/withT'
import { Link, Router } from '../../lib/routes'
import { swissTime } from '../../lib/utils/format'

import {
  Loader,
  InlineSpinner,
  Interaction,
  Editorial,
  Label,
  linkRule,
  Button,
  Field,
  Checkbox,
  A,
  colors
} from '@project-r/styleguide'

import MaskedInput from 'react-maskedinput'

import { getRepoHistory, COMMIT_LIMIT } from '../../pages/repo/tree'
import { getRepoWithPublications } from './Current'

import { renderMdast } from 'mdast-react-render'

import { getSchema } from '../../components/Templates'
import RepoArchivedBanner from '../../components/Repo/ArchivedBanner'

import useValidation from './useValidation'

const publishMutation = gql`
  mutation publish(
    $repoId: ID!
    $commitId: ID!
    $prepublication: Boolean!
    $scheduledAt: DateTime
    $updateMailchimp: Boolean!
    $ignoreUnresolvedRepoIds: Boolean
    $notifySubscribers: Boolean
  ) {
    publish(
      repoId: $repoId
      commitId: $commitId
      prepublication: $prepublication
      scheduledAt: $scheduledAt
      updateMailchimp: $updateMailchimp
      ignoreUnresolvedRepoIds: $ignoreUnresolvedRepoIds
      notifySubscribers: $notifySubscribers
    ) {
      unresolvedRepoIds
      publication {
        name
      }
    }
  }
`

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

export const getRepoWithCommit = gql`
  query repoWithCommit($repoId: ID!, $commitId: ID!) {
    repo(id: $repoId) {
      id
      isArchived
      meta {
        publishDate
      }
      latestPublications {
        date
        name
        live
        prepublication
        scheduledAt
      }
      commit(id: $commitId) {
        id
        message
        date
        author {
          email
          name
        }
        document {
          id
          content
          meta {
            slug
            emailSubject
            template
            title
            description
            image
            facebookDescription
            facebookImage
            facebookTitle
            twitterDescription
            twitterImage
            twitterTitle
            format {
              id
              repoId
              meta {
                path
                title
                color
                kind
              }
            }
            section {
              id
              repoId
              meta {
                path
                title
                color
                kind
              }
            }
          }
          subscribedBy(includeParents: true) {
            totalCount
          }
        }
      }
    }
  }
`

const styles = {
  mask: css({
    '::placeholder': {
      color: 'transparent'
    },
    ':focus': {
      '::placeholder': {
        color: '#ccc'
      }
    }
  })
}

const scheduledAtFormat = '%d.%m.%Y %H:%M'
const scheduledAtParser = swissTime.parse(scheduledAtFormat)
const scheduledAtFormater = swissTime.format(scheduledAtFormat)

const PADDING_X = 5

const PREVIEW_SIZES = [
  {
    label: 'mobile',
    width: 320,
    height: 480,
    paddingTop: 40,
    paddingBottom: 40,
    borderRadius: 10
  },
  {
    label: 'desktop',
    width: 1024,
    height: 800,
    paddingTop: PADDING_X,
    paddingBottom: PADDING_X,
    borderRadius: 3
  }
]

const Form = ({
  t,
  repo,
  commit,
  commit: {
    document: { meta, content }
  },
  publish
}) => {
  const [state, setCompleteState] = useState({
    prepublication: true,
    scheduled: false,
    updateMailchimp: false
  })
  const setState = newState =>
    setCompleteState(state => ({ ...state, ...newState }))

  const {
    prepublication,
    updateMailchimp,
    notifySubscribers,
    scheduled,
    scheduledAt,
    publishing
  } = state

  const schema = getSchema(meta.template)

  const { errors, warnings, links } = useValidation({
    meta,
    content,
    t,
    updateMailchimp
  })

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
    <>
      <Label>{t('publish/commit/selected')}</Label>
      <Interaction.P>{commit.message}</Interaction.P>
      <Label>
        {commit.author.name}
        <br />
        {timeFormat(new Date(commit.date))}
      </Label>
      <Interaction.P>
        <Label>
          <Link
            route='repo/tree'
            params={{
              repoId: repo.id.split('/')
            }}
          >
            <a {...linkRule}>{t('publish/commit/change')}</a>
          </Link>
        </Label>
      </Interaction.P>

      <br />
      <br />

      <Label>{t('publish/meta/date/label')}</Label>
      <Interaction.P>{timeFormat(designatedPublishDate)}</Interaction.P>
      <Label>{t('publish/meta/path/label')}</Label>
      <Interaction.P>
        {FRONTEND_BASE_URL.replace(/https?:\/\/(www\.)?/, '')}
        {content.meta.path ||
          (schema.getPath
            ? schema.getPath({
                ...meta,
                publishDate: designatedPublishDate
              })
            : `/${meta.slug}`)}
      </Interaction.P>

      <br />
      <br />

      {hasErrors && (
        <>
          <Interaction.P style={{ color: colors.error }}>
            {t('publish/validation/hasErrors')}
          </Interaction.P>
          <ul style={{ color: colors.error }}>
            {errors.map((error, i) => (
              <li key={i}>
                <Interaction.P
                  style={{ color: colors.error, wordBreak: 'break-all' }}
                >
                  {error}
                </Interaction.P>
              </li>
            ))}
          </ul>
          <br />
          <br />
        </>
      )}
      {warnings.length > 0 && (
        <>
          <Interaction.P style={{ color: colors.social }}>
            {t('publish/validation/hasWarnings')}
          </Interaction.P>
          <ul style={{ color: colors.social }}>
            {warnings.map((warning, i) => (
              <li key={i}>
                <Interaction.P
                  style={{ color: colors.social, wordBreak: 'break-all' }}
                >
                  {warning}
                </Interaction.P>
              </li>
            ))}
          </ul>
          <br />
          <br />
        </>
      )}

      {links.length > 0 && (
        <>
          <Interaction.P>
            <Editorial.A
              href='#'
              onClick={e => {
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
                    style={{
                      wordBreak: 'break-all',
                      color: link.errors.length
                        ? colors.error
                        : link.warnings.length
                        ? colors.social
                        : undefined
                    }}
                  >
                    {t.elements('publish/validation/link', {
                      text: link.text,
                      link: (
                        <Editorial.A key='link' href={link.url}>
                          {link.url}
                        </Editorial.A>
                      )
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
            prepublication: value
          })
        }}
      >
        {t('publish/label/prepublication')}
      </Checkbox>
      <br />
      <br />
      {!prepublication && (
        <div>
          <Checkbox
            checked={notifySubscribers}
            onChange={(_, value) => {
              setState({
                notifySubscribers: value
              })
            }}
          >
            {t.pluralize('publish/label/notifySubscribers', {
              count: commit.document.subscribedBy.totalCount
            })}
          </Checkbox>
          <br />
          <br />
        </div>
      )}
      {schema.emailTemplate && (
        <div>
          <Checkbox
            checked={updateMailchimp}
            onChange={(_, value) => {
              setState({
                updateMailchimp: value
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
              scheduledAt: scheduledAtFormater(nextDate)
            })
          }

          setState({
            scheduled: value
          })
        }}
      >
        {t('publish/label/scheduled')}
      </Checkbox>

      {scheduled && (
        <Field
          renderInput={inputProps => (
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
              scheduledAt: value
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
                {state.unresolvedRepoIds.map(repoId => (
                  <li key={repoId}>
                    <Link
                      route='repo/tree'
                      params={{
                        repoId: repoId.split('/')
                      }}
                    >
                      <a {...linkRule}>
                        {repoId.replace(`${GITHUB_ORG}/`, '')}
                      </a>
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
                      ignoreUnresolvedRepoIds: value
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
                prepublication,
                updateMailchimp,
                notifySubscribers,
                scheduledAt: scheduled ? scheduledAtDate : undefined,
                ignoreUnresolvedRepoIds: state.ignoreUnresolvedRepoIds
              })
                .then(({ data }) => {
                  if (data.publish.publication) {
                    Router.pushRoute('repo/tree', {
                      repoId: repo.id.split('/')
                    })
                  } else {
                    setState({
                      publishing: false,
                      ignoreUnresolvedRepoIds: undefined,
                      unresolvedRepoIds: data.publish.unresolvedRepoIds
                    })
                  }
                })
                .catch(error => {
                  setState({
                    publishing: false,
                    unresolvedRepoIds: undefined,
                    ignoreUnresolvedRepoIds: undefined,
                    error: error
                  })
                })
            }}
          >
            {t('publish/trigger')}
          </Button>
        </div>
      )}
    </>
  )
}

const Preview = ({
  t,
  commit,
  commit: {
    document: { meta }
  }
}) => {
  const [size, setSize] = useState(PREVIEW_SIZES[0])

  const schema = getSchema(meta.template)

  return (
    <>
      <Interaction.H2>{t('publish/preview/title')}</Interaction.H2>
      <Interaction.P>
        {intersperse(
          PREVIEW_SIZES.map(previewSize => {
            const label = t(
              `publish/preview/${previewSize.label}`,
              undefined,
              previewSize.label
            )
            if (previewSize === size) {
              return label
            }
            return (
              <A
                key={label}
                href='#'
                onClick={e => {
                  e.preventDefault()
                  setSize(previewSize)
                }}
              >
                {label}
              </A>
            )
          }),
          () => ' '
        )}
      </Interaction.P>

      <IFrame
        size={size}
        style={{
          // transition: 'padding 400ms, border-radius 400ms, width 400ms',
          paddingLeft: PADDING_X,
          paddingRight: PADDING_X,
          paddingTop: size.paddingTop,
          paddingBottom: size.paddingBottom,
          borderRadius: size.borderRadius,
          backgroundColor: '#eee',
          width: size.width + PADDING_X * 2
        }}
        dark={commit.document.content && commit.document.content.meta.darkMode}
      >
        {renderMdast(
          {
            ...commit.document.content,
            format: commit.document.meta.format,
            section: commit.document.meta.section
          },
          schema
        )}
      </IFrame>
    </>
  )
}

const PublishForm = ({ t, data, publish }) => {
  const { loading, error, repo } = data

  return (
    <div>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const { isArchived, commit } = repo

          if (isArchived) {
            return <RepoArchivedBanner />
          }

          return (
            <div>
              <Form t={t} repo={repo} commit={commit} publish={publish} />

              <br />
              <br />

              <Preview t={t} commit={commit} />
            </div>
          )
        }}
      />
    </div>
  )
}

export default compose(
  withT,
  graphql(publishMutation, {
    props: ({ mutate, ownProps }) => ({
      publish: variables =>
        mutate({
          variables,
          refetchQueries: [
            {
              query: getRepoHistory,
              variables: {
                repoId: ownProps.repoId,
                first: COMMIT_LIMIT
              }
            },
            {
              query: getRepoWithPublications,
              variables: {
                repoId: ownProps.repoId
              }
            }
          ]
        })
    })
  }),
  graphql(getRepoWithCommit)
)(PublishForm)
