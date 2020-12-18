import React from 'react'
import { css } from 'glamor'
import { fontStyles, useColorContext } from '@project-r/styleguide'
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
    borderLeftWidth: 1,
    borderLeftStyle: 'solid',
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
    paddingLeft: 10,
    ...fontStyles.sansSerifRegular14
  }),
  templateContainer: css({
    paddingBottom: 20
  })
}

const TemplateHeading = withT(({ t, template }) => (
  <span {...styles.templateHeading}>{t(`repo/calendar/${template}`)}</span>
))

const ReposByTemplate = ({ template, repos = [], date, ...props }) => {
  const placeholders =
    (placeholdersConfig[template] || []).filter(placeholder =>
      matchWeekDays(date, placeholder.publicationDays)
    ) || []

  const reposAndPlaceholders = placeholders.reduce((acc, placeholder) => {
    const isInList = repos.find(
      repo =>
        repo.id
          .split('/')[1]
          .startsWith(placeholder.repoId.replace('template-', ''))
      // TODO: store prefixes somewhere
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

  return repos ? (
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
            <Placeholder key={repo.repoId} placeholder={repo} {...props} />
          ) : (
            <Repo key={repo.id} repo={repo} {...props} />
          )
        )}
    </div>
  ) : null
}

const DateHeading = ({ date }) => (
  <span {...styles.dateHeading}>{reformatUrlDate(date, columnDateFormat)}</span>
)

const Day = ({ day: { date, repos }, isPast }) => {
  const [colorScheme] = useColorContext()
  const reposByTemplate = group(repos, repo =>
    repo.latestCommit.document.meta.template === 'editorialNewsletter'
      ? 'newsletter'
      : 'other'
  )
  return (
    <div
      {...styles.container}
      {...colorScheme.set('color', isPast ? 'textSoft' : 'text')}
    >
      <DateHeading date={date} />
      <div
        {...styles.reposContainer}
        {...colorScheme.set('borderLeftColor', 'divider')}
      >
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
    </div>
  )
}

export default Day
