import React from 'react'
import { css } from 'glamor'
import { fontStyles } from '@project-r/styleguide'
import {
  columnDateFormat,
  getIsoDate,
  matchWeekDays,
  reformatUrlDate
} from './utils'
import Repo, { Placeholder } from './Repo'
import { ascending, group } from 'd3-array'
import withT from '../../lib/withT'
import { placeholdersConfig } from './config'

const styles = {
  container: css({
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column'
  }),
  reposContainer: css({
    flexGrow: 1
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

const ReposByTemplate = ({ template, repos = [], date, isPast, ...props }) => {
  const placeholders = isPast
    ? []
    : (placeholdersConfig[template] || []).filter(placeholder =>
        matchWeekDays(date, placeholder.publicationDays)
      ) || []

  const reposAndPlaceholders = placeholders.reduce((acc, placeholder) => {
    const isInList = repos.find(
      repo =>
        repo.id
          .split('/')[1]
          .startsWith(placeholder.repoId.replace('template-', ''))
      // TODO: store prefixes somewhere template-www -> wwww-meine-intanze
    )
    return isInList
      ? acc
      : acc.concat({
          ...placeholder,
          meta: {
            publishDate: getIsoDate(date, placeholder.publicationTime)
          },
          isPlaceholder: true
        })
  }, repos)

  return reposAndPlaceholders?.length ? (
    <div {...styles.templateContainer}>
      <TemplateHeading template={template} />
      {reposAndPlaceholders
        .sort((repo1, repo2) =>
          ascending(
            new Date(repo1.meta.publishDate),
            new Date(repo2.meta.publishDate)
          )
        )
        .map(repo =>
          repo.isPlaceholder ? (
            <Placeholder
              key={repo.repoId}
              placeholder={repo}
              isPast={isPast}
              {...props}
            />
          ) : (
            <Repo key={repo.id} repo={repo} isPast={isPast} {...props} />
          )
        )}
    </div>
  ) : null
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
      <div {...styles.reposContainer}>
        <ReposByTemplate
          repos={reposByTemplate.get('newsletter')}
          template='newsletters'
          date={date}
          isPast={isPast}
          discrete={discrete}
          isNewsletter
        />
        <ReposByTemplate
          repos={reposByTemplate.get('other')}
          template='articles'
          date={date}
          isPast={isPast}
          discrete={discrete}
        />
      </div>
    </div>
  )
}

export default Day
