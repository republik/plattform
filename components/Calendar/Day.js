import React from 'react'
import { css } from 'glamor'
import { fontStyles, useColorContext } from '@project-r/styleguide'
import { columnDateFormat, reformatUrlDate } from './utils'
import Repo from './Repo'
import { ascending, group } from 'd3-array'
import withT from '../../lib/withT'

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

const ReposByTemplate = ({ template, repos, ...props }) =>
  repos ? (
    <div {...styles.templateContainer}>
      <TemplateHeading template={template} />
      {repos
        .sort((repo1, repo2) =>
          ascending(
            new Date(repo1.meta.publishDate),
            new Date(repo2.meta.publishDate)
          )
        )
        .map(repo => (
          <Repo key={repo.id} repo={repo} {...props} />
        ))}
    </div>
  ) : null

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
          isPast={isPast}
          isNewsletter
        />
        <ReposByTemplate
          repos={reposByTemplate.get('other')}
          template='articles'
          isPast={isPast}
        />
      </div>
    </div>
  )
}

export default Day
