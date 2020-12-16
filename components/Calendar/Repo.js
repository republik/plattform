import React, { useMemo } from 'react'
import { css } from 'glamor'
import { Link } from '../../lib/routes'
import { fontStyles, useColorContext, inQuotes } from '@project-r/styleguide'
import { getLabel, getTitle } from '../Repo/utils'
import { Phase } from '../Repo/Phases'

const styles = {
  container: css({
    cursor: 'pointer',
    borderWidth: 1,
    borderStyle: 'solid',
    margin: 10,
    padding: 5,
    transition: 'all 0.5s'
  }),
  title: css({
    textDecoration: 'underline',
    padding: '5px 0'
  }),
  label: css({
    marginBottom: 10,
    ...fontStyles.sansSerifMedium14
  }),
  status: css({
    marginTop: 10
  }),
  commitMsg: css({
    ...fontStyles.sansSerifRegular14
  })
}

const CommitMsg = ({ msg }) => (
  <span {...styles.commitMsg}>{inQuotes(msg)}</span>
)

const Repo = ({ repo, isNewsletterX, isPast }) => {
  const [colorScheme] = useColorContext()
  const { id, currentPhase } = repo
  const label = getLabel(repo)
  const isNewsletter =
    repo.latestCommit.document.meta.template === 'editorialNewsletter'

  const colorStyles = useMemo(
    () =>
      css({
        borderColor: colorScheme.getCSSColor('divider'),
        backgroundColor: colorScheme.getCSSColor(
          isNewsletter ? 'hover' : 'default'
        ),
        '@media (hover)': {
          ':hover': {
            borderColor: colorScheme.getCSSColor('hover')
          }
        }
      }),
    [colorScheme]
  )
  return (
    <Link route='repo/tree' params={{ repoId: id.split('/') }} passHref>
      <div {...styles.container} {...colorStyles}>
        {label && <div {...styles.label}>{label}</div>}
        <div {...styles.title}>{getTitle(repo)}</div>
        <div {...styles.status}>
          {isNewsletter ? (
            <CommitMsg msg={repo.latestCommit.message} />
          ) : (
            <Phase phase={currentPhase} discrete={isPast} />
          )}
        </div>
      </div>
    </Link>
  )
}

export default Repo
