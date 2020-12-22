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
import { placeholderRepos } from './config'

const styles = {
  container: css({
    flex: '1 1 0',
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
    paddingBottom: 20
  })
}

const TemplateHeading = withT(({ t, template }) => (
  <span {...styles.templateHeading}>{t(`repo/calendar/${template}`)}</span>
))

const Repos = ({ repos, ...props }) => {
  const sortedRepos = repos.sort((repo1, repo2) =>
    ascending(
      new Date(repo1.meta.publishDate),
      new Date(repo2.meta.publishDate)
    )
  )
  return (
    <>
      {sortedRepos.map(repo =>
        repo.isPlaceholder ? (
          <Placeholder
            key={repo.repoId}
            repoId={repo.repoId}
            placeholderDate={repo.meta.publishDate}
            {...props}
          />
        ) : (
          <Repo key={repo.id} repo={repo} {...props} />
        )
      )}
    </>
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
    : getPlaceholders(placeholderRepos[template], date).reduce(
        (acc, placeholder) => {
          const isInList = containsRepoFromTemplate(repos, placeholder.repoId)
          return isInList
            ? acc
            : acc.concat(reformatPlaceholder(placeholder, date))
        },
        repos
      )

  if (!reposAndPlaceholders.length) return null

  return (
    <div {...styles.templateContainer}>
      <TemplateHeading template={template} />
      <Repos
        repos={reposAndPlaceholders}
        date={date}
        isPast={isPast}
        isNewsletter={isNewsletter}
      />
    </div>
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
