import React from 'react'
import { css } from 'glamor'
import { useColorContext } from '@project-r/styleguide'
import { columnDateFormat, reformatUrlDate } from './utils'
import Repo from './Repo'

const styles = {
  container: css({
    flex: 1,
    borderLeftWidth: 1,
    borderLeftStyle: 'solid'
  }),
  containerPast: css({
    opacity: 0.5
  })
}

const Day = ({ day: { date, repos }, isPast }) => {
  const [colorScheme] = useColorContext()

  return (
    <div
      {...styles.container}
      {...(isPast && styles.containerPast)}
      {...colorScheme.set('borderLeftColor', 'divider')}
    >
      <strong style={{ paddingLeft: 5 }}>
        {reformatUrlDate(date, columnDateFormat)}
      </strong>
      <div>
        {repos.map(repo => (
          <Repo key={repo.id} repo={repo} />
        ))}
      </div>
    </div>
  )
}

export default Day
