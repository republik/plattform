import React from 'react'
import { css } from 'glamor'
import { Link } from '../../lib/routes'
import {
  fontStyles,
  useColorContext,
  inQuotes,
  colors
} from '@project-r/styleguide'
import { getLabel, getTitle } from '../Repo/utils'
import { Phase } from '../Repo/Phases'
import EditMetaDate from '../Repo/EditMetaDate'
import { graphql } from 'react-apollo'
import { GITHUB_ORG } from '../../lib/settings'
import { getPlaceholder } from './graphql'
import { getSpecialPrefix, getUrlDate } from './utils'
import withT from '../../lib/withT'

const styles = {
  container: css({
    cursor: 'pointer',
    borderWidth: 1,
    borderStyle: 'solid',
    margin: '0 20px 10px 0',
    padding: 5,
    ':hover .title': {
      textDecoration: 'underline'
    }
  }),
  title: css({
    padding: '5px 5px 5px 0'
  }),
  label: css({
    marginBottom: 10,
    ...fontStyles.sansSerifMedium14
  }),
  status: css({
    marginTop: 10
  }),
  editDate: css({
    ...fontStyles.sansSerifRegular14,
    marginBottom: 10
  }),
  commitMsg: css({
    ...fontStyles.sansSerifRegular14
  }),
  placeholder: css({
    ...fontStyles.sansSerifItalic,
    textTransform: 'capitalize'
  })
}

export const Placeholder = graphql(getPlaceholder)(
  ({ data: { repo }, ...props }) => {
    return repo ? <Repo repo={repo} {...props} /> : null
  }
)

const RepoLabel = ({ repo }) => {
  const label = getLabel(repo)
  if (!label) return null
  const format = repo.latestCommit.document.meta.format
  const formatColor = format?.meta.color || colors[format?.meta.kind]
  return (
    <div
      {...styles.label}
      style={{
        color: formatColor
      }}
    >
      {label}
    </div>
  )
}

const PublicationDate = ({ repoId, publishDate }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      onClick={e => e.preventDefault()}
      {...styles.editDate}
      {...colorScheme.set('color', 'textSoft')}
    >
      <EditMetaDate publishDate={publishDate} repoId={repoId} />
    </div>
  )
}

const CommitMsg = ({ commit }) => (
  <span {...styles.commitMsg}>
    {commit.author.name}: {inQuotes(commit.message)}
  </span>
)

const PlaceholderLink = ({ repo, placeholderDate, children }) => {
  const {
    id,
    latestCommit: {
      document: {
        meta: { title, template }
      }
    }
  } = repo
  const urlDate = getUrlDate(new Date(placeholderDate))

  return (
    <Link
      route='repo/edit'
      params={{
        repoId: [GITHUB_ORG, `${getSpecialPrefix(id)}-${urlDate}`],
        commitId: 'new',
        title,
        schema: template,
        publishDate: placeholderDate
      }}
      passHref
    >
      {children}
    </Link>
  )
}

const RepoLink = ({ repo, placeholderDate, children }) => {
  const { id } = repo
  return placeholderDate ? (
    <PlaceholderLink repo={repo} placeholderDate={placeholderDate}>
      {children}
    </PlaceholderLink>
  ) : (
    <Link route='repo/tree' params={{ repoId: id.split('/') }} passHref>
      {children}
    </Link>
  )
}

const Repo = withT(({ t, repo, isNewsletter, isPast, placeholderDate }) => {
  const [colorScheme] = useColorContext()
  const {
    id,
    currentPhase,
    meta: { publishDate },
    latestCommit
  } = repo
  return (
    <RepoLink repo={repo} placeholderDate={placeholderDate}>
      <div
        {...styles.container}
        {...colorScheme.set('borderColor', isNewsletter ? 'hover' : 'divider')}
        {...colorScheme.set(
          'backgroundColor',
          isNewsletter ? 'hover' : 'default'
        )}
      >
        <RepoLabel repo={repo} />
        <div {...styles.title}>
          {placeholderDate ? (
            <span {...styles.placeholder}>{t('repo/add/submit')}</span>
          ) : (
            <span className='title'>{getTitle(repo)}</span>
          )}
        </div>
        {!placeholderDate && (
          <div {...styles.status}>
            {!isPast && !isNewsletter && (
              <PublicationDate repoId={id} publishDate={publishDate} />
            )}
            {isNewsletter ? (
              <CommitMsg commit={latestCommit} />
            ) : (
              <Phase phase={currentPhase} />
            )}
          </div>
        )}
      </div>
    </RepoLink>
  )
})

export default Repo
