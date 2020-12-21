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
  })
}

export const Placeholder = graphql(getPlaceholder, {
  options: ({ placeholder }) => ({
    variables: {
      repoId: `${GITHUB_ORG}/${placeholder.repoId}`
    }
  })
})(({ data: { repo }, ...props }) => {
  return repo ? <Repo repo={repo} {...props} isPlaceholder /> : null
})

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

const Repo = ({ repo, isNewsletter, isPast, isPlaceholder }) => {
  const [colorScheme] = useColorContext()
  const {
    id,
    currentPhase,
    meta: { publishDate }
  } = repo
  // TODO: correct URL + set publication date for placeholders
  return (
    <Link route='repo/tree' params={{ repoId: id.split('/') }} passHref>
      <div
        {...styles.container}
        {...colorScheme.set('borderColor', isNewsletter ? 'hover' : 'divider')}
        {...colorScheme.set(
          'backgroundColor',
          isNewsletter ? 'hover' : 'default'
        )}
      >
        <RepoLabel repo={repo} />
        <div {...styles.title} className='title'>
          {getTitle(repo)}
        </div>
        {!isPlaceholder && (
          <div {...styles.status}>
            {!isPast && !isNewsletter && (
              <PublicationDate repoId={id} publishDate={publishDate} />
            )}
            {isNewsletter ? (
              <CommitMsg commit={repo.latestCommit} />
            ) : (
              <Phase phase={currentPhase} />
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export default Repo
