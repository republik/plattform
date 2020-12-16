import React from 'react'
import { css } from 'glamor'
import { fontStyles, useColorContext } from '@project-r/styleguide'
import { columnDateFormat, reformatUrlDate } from './utils'
import Repo from './Repo'

const styles = {
  container: css({
    flex: '1 1 0',
    borderLeftWidth: 1,
    borderLeftStyle: 'solid'
  }),
  containerPast: css({
    opacity: 0.5
  }),
  dateHeading: css({
    display: 'block',
    paddingLeft: 5,
    marginBottom: 15,
    ...fontStyles.sansSerifMedium14
  })
}

const DateHeading = ({ date }) => (
  <span {...styles.dateHeading}>{reformatUrlDate(date, columnDateFormat)}</span>
)

const Day = ({ day: { date, repos }, isPast }) => {
  const [colorScheme] = useColorContext()

  return (
    <div
      {...styles.container}
      {...(isPast && styles.containerPast)}
      {...colorScheme.set('borderLeftColor', 'divider')}
    >
      <DateHeading date={date} />
      <div>
        {repos.map(repo => (
          <Repo key={repo.id} repo={repo} />
        ))}
      </div>
    </div>
  )
}

export default Day
