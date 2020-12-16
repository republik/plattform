import React from 'react'
import { css } from 'glamor'
import { Link } from '../../lib/routes'
import {
  fontStyles,
  useColorContext,
  inQuotes,
  underline
} from '@project-r/styleguide'
import { getLabel, getTitle } from '../Repo/utils'
import { Phase } from '../Repo/Phases'

const styles = {
  container: css({
    cursor: 'pointer',
    borderWidth: 1,
    borderStyle: 'solid',
    margin: 10,
    padding: 5
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

const Repo = ({ repo, isNewsletterX, isPast }) => {
  const [colorScheme] = useColorContext()
  const { id, currentPhase } = repo
  const label = getLabel(repo)
  const isNewsletter =
    repo.latestCommit.document.meta.template === 'editorialNewsletter'
  return (
    <Link route='repo/tree' params={{ repoId: id.split('/') }} passHref>
      <div
        {...styles.container}
        {...colorScheme.set('borderColor', 'divider')}
        {...colorScheme.set(
          'backgroundColor',
          isNewsletter ? 'hover' : 'default'
        )}
      >
        {label && <div {...styles.label}>{label}</div>}
        <div {...styles.title}>{getTitle(repo)}</div>
        <div {...styles.status}>
          {isNewsletter ? (
            <span {...styles.commitMsg}>
              {inQuotes(repo.latestCommit.message)}
            </span>
          ) : (
            <Phase phase={currentPhase} discrete={isPast} />
          )}
        </div>
      </div>
    </Link>
  )
}

export default Repo
