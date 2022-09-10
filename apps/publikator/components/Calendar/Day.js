import { css } from 'glamor'
import { fontStyles } from '@project-r/styleguide'
import {
  columnDateFormat,
  getPlaceholders,
  reformatPlaceholder,
  reformatUrlDate,
} from '../../lib/utils/calendar'
import { existsAlready } from '../../lib/utils/repo'
import Repo, { Placeholder } from './Repo'
import { ascending } from 'd3-array'
import { parseJSONObject } from '../../lib/safeJSON'
import { WEEK_TEMPLATE_REPOS } from '../../lib/settings'
const templateRepos = parseJSONObject(WEEK_TEMPLATE_REPOS)

const styles = {
  dateHeading: css({
    display: 'block',
    marginBottom: 10,
    ...fontStyles.sansSerifMedium14,
  }),
  templateHeading: css({
    display: 'block',
    marginBottom: 10,
    ...fontStyles.sansSerifRegular14,
  }),
  templateContainer: css({
    padding: '10px 0 0',
  }),
}

const Repos = ({ repos, isNewsletter, ...props }) => {
  const sortedRepos = repos.sort((repo1, repo2) =>
    ascending(
      new Date(repo1.meta.publishDate),
      new Date(repo2.meta.publishDate),
    ),
  )
  return (
    <div {...styles.templateContainer}>
      {sortedRepos.map((repo) =>
        repo.isPlaceholder && repo.template ? (
          <Repo
            key={repo.template}
            repo={{
              latestCommit: {
                document: {
                  meta: { title: repo.template, template: repo.template },
                },
              },
            }}
            placeholderDate={repo.meta.publishDate}
            isNewsletter={isNewsletter}
            {...props}
          />
        ) : repo.isPlaceholder ? (
          <Placeholder
            key={repo.repoId}
            repoId={repo.repoId}
            template={repo.template}
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
        ),
      )}
    </div>
  )
}

export const ReposByTemplate = ({
  template,
  repos = [],
  date,
  isPast,
  isNewsletter,
}) => {
  const weeklyRepos = template
    .map((t) => templateRepos[t])
    .flat(1)
    .filter(Boolean)

  const reposAndPlaceholders = isPast
    ? repos
    : getPlaceholders(weeklyRepos, date).reduce((acc, placeholder) => {
        const isInList = existsAlready(repos, placeholder)
        return isInList
          ? acc
          : acc.concat(reformatPlaceholder(placeholder, date))
      }, repos)

  return (
    <Repos
      repos={reposAndPlaceholders}
      date={date}
      isPast={isPast}
      isNewsletter={isNewsletter}
    />
  )
}

export const DateHeading = ({ date }) => (
  <span {...styles.dateHeading}>{reformatUrlDate(date, columnDateFormat)}</span>
)
