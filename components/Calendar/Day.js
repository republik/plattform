import React from 'react'
import { css } from 'glamor'
import { fontStyles } from '@project-r/styleguide'
import {
  columnDateFormat,
  getPlaceholders,
  reformatPlaceholder,
  reformatUrlDate
} from '../../lib/utils/calendar'
import { containsRepoFromTemplate } from '../../lib/utils/repo'
import Repo, { Placeholder } from './Repo'
import { ascending, group } from 'd3-array'
import withT from '../../lib/withT'
import { parseJSONObject } from '../../lib/safeJSON'
import { WEEK_TEMPLATE_REPOS } from '../../lib/settings'
const templateRepos = parseJSONObject(WEEK_TEMPLATE_REPOS)

const styles = {
  container: css({
    flexGrow: 1,
    flexBasis: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  }),
  dateHeading: css({
    display: 'block',
    marginBottom: 10,
    ...fontStyles.sansSerifMedium14
  }),
  templateHeading: css({
    display: 'block',
    marginBottom: 10,
    ...fontStyles.sansSerifRegular14
  }),
  templateContainer: css({
    padding: '10px 0 20px'
  })
}

const Repos = ({ repos, isNewsletter, ...props }) => {
  const sortedRepos = repos.sort((repo1, repo2) =>
    ascending(
      new Date(repo1.meta.publishDate),
      new Date(repo2.meta.publishDate)
    )
  )
  return (
    <div
      {...styles.templateContainer}
      style={{ height: isNewsletter ? 225 : 'auto' }}
    >
      {sortedRepos.map(repo =>
        repo.isPlaceholder ? (
          <Placeholder
            key={repo.repoId}
            repoId={repo.repoId}
            placeholderDate={repo.meta.publishDate}
            isNewsletter={isNewsletter}
            {...props}
          />
        ) : (
          <Repo
            key={repo.id}
            repo={repo}
            isNewsletter={isNewsletter}
            {...props}
          />
        )
      )}
    </div>
  )
}

const ReposByTemplate = ({
  template,
  repos = [],
  date,
  isPast,
  isNewsletter
}) => {
  const reposAndPlaceholders = isPast
    ? repos
    : getPlaceholders(templateRepos[template], date).reduce(
        (acc, placeholder) => {
          const isInList = containsRepoFromTemplate(repos, placeholder.repoId)
          return isInList
            ? acc
            : acc.concat(reformatPlaceholder(placeholder, date))
        },
        repos
      )

  return (
    <Repos
      repos={reposAndPlaceholders}
      date={date}
      isPast={isPast}
      isNewsletter={isNewsletter}
    />
  )
}

const DateHeading = ({ date }) => (
  <span {...styles.dateHeading}>{reformatUrlDate(date, columnDateFormat)}</span>
)

const Day = ({ day: { date, repos }, isPast, discrete }) => {
  const reposByTemplate = group(repos, repo =>
    repo.latestCommit.document.meta.template === 'editorialNewsletter'
      ? 'newsletter'
      : 'other'
  )
  return (
    <div {...styles.container} style={{ opacity: discrete ? 0.5 : 1 }}>
      <DateHeading date={date} />
      <ReposByTemplate
        repos={reposByTemplate.get('newsletter')}
        template='newsletters'
        date={date}
        isPast={isPast}
        isNewsletter
      />
      <ReposByTemplate
        repos={reposByTemplate.get('other')}
        template='articles'
        date={date}
        isPast={isPast}
      />
    </div>
  )
}

export default Day
