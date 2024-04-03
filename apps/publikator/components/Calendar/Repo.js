import { css } from 'glamor'
import Link from 'next/link'
import {
  fontStyles,
  useColorContext,
  inQuotes,
  colors,
} from '@project-r/styleguide'
import { graphql } from '@apollo/client/react/hoc'
import { Phase } from '../Repo/Phases'
import EditMetaDate from '../Repo/EditMetaDate'
import { GITHUB_ORG } from '../../lib/settings'
import { getPlaceholder } from './graphql'
import { getLabel, getTitle, getTemplateRepoPrefix } from '../../lib/utils/repo'
import { getUrlDate } from '../../lib/utils/calendar'
import withT from '../../lib/withT'

const ellipsisRule = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const styles = {
  container: css({
    cursor: 'pointer',
    borderWidth: 1,
    borderStyle: 'solid',
    margin: '0 20px 10px 0',
    padding: 8,
    ':hover .title': {
      textDecoration: 'underline',
    },
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none',
  }),
  title: css({
    ...ellipsisRule,
  }),
  label: css({
    marginBottom: 10,
    ...fontStyles.sansSerifMedium14,
    ...ellipsisRule,
  }),
  status: css({
    marginTop: 10,
    ...ellipsisRule,
  }),
  editDate: css({
    ...fontStyles.sansSerifRegular14,
    marginBottom: 10,
  }),
  commitMsg: css({
    ...fontStyles.sansSerifRegular14,
  }),
  placeholder: css({
    fontStyle: 'italic',
    textTransform: 'capitalize',
    lineHeight: '2rem',
  }),
}

export const Placeholder = graphql(getPlaceholder)(
  ({ data: { repo }, ...props }) => {
    return repo ? <Repo repo={repo} {...props} /> : null
  },
)

const RepoLabel = ({ repo, isNewsletter }) => {
  const [colorScheme] = useColorContext()
  const label = getLabel(repo)
  const format = repo.latestCommit.document.meta.format
  const formatColor = format?.meta.color || colors[format?.meta.kind]
  return (
    <div
      {...styles.label}
      style={{
        color: label ? formatColor : colorScheme.getCSSColor('textSoft'),
      }}
    >
      {label || (isNewsletter ? 'Newsletter' : 'Beitrag')}
    </div>
  )
}

const PublicationDate = ({ repoId, publishDate, readOnly }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      onClick={(e) => e.preventDefault()}
      {...styles.editDate}
      {...colorScheme.set('color', 'textSoft')}
    >
      <EditMetaDate
        publishDate={publishDate}
        repoId={repoId}
        readOnly={readOnly}
      />
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
        meta: { title, template },
      },
    },
  } = repo
  const urlDate = getUrlDate(new Date(placeholderDate))
  const templateRepoId = id ? { templateRepoId: id } : {}

  return (
    <Link
      href={{
        pathname: `/repo/${GITHUB_ORG}/${
          id ? getTemplateRepoPrefix(id) : template
        }-${urlDate}/edit`,
        query: {
          commitId: 'new',
          title,
          schema: template,
          publishDate: placeholderDate,
          ...templateRepoId,
        },
      }}
      passHref
      legacyBehavior
    >
      {children}
    </Link>
  )
}

const RepoLink = ({ repo, placeholderDate, children }) => {
  const { id } = repo
  return placeholderDate ? (
    <PlaceholderLink repo={repo} placeholderDate={placeholderDate}>
      <a {...styles.link}>{children}</a>
    </PlaceholderLink>
  ) : (
    <Link
      href={`/repo/${id}/tree`}
      passHref
      title={getTitle(repo)}
      {...styles.link}
    >
      {children}
    </Link>
  )
}

const Repo = withT(({ t, repo, isNewsletter, isPast, placeholderDate }) => {
  const [colorScheme] = useColorContext()
  const { id, currentPhase, meta, latestCommit } = repo
  const publishDate = meta?.publishDate
  return (
    <RepoLink repo={repo} placeholderDate={placeholderDate}>
      <div
        {...styles.container}
        {...colorScheme.set('borderColor', isNewsletter ? 'hover' : 'divider')}
        {...colorScheme.set(
          'backgroundColor',
          isNewsletter ? 'hover' : 'default',
        )}
        style={{ paddingBottom: placeholderDate ? 20 : 5 }}
      >
        <RepoLabel repo={repo} isNewsletter={isNewsletter} />
        <div {...styles.title} className='title'>
          {placeholderDate ? (
            <span {...styles.placeholder}>{t('repo/add/submit')}</span>
          ) : (
            getTitle(repo)
          )}
        </div>
        {!placeholderDate && (
          <div {...styles.status}>
            {!isNewsletter && (
              <PublicationDate
                repoId={id}
                publishDate={publishDate}
                readOnly={isPast}
              />
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
