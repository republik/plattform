import React, { useEffect, useState } from 'react'
import gql from 'graphql-tag'
import { css } from 'glamor'
import { compose, graphql } from 'react-apollo'
import { withRouter } from 'next/router'
import { group } from 'd3-array'
import { Link, Router } from '../../lib/routes'
import { Label, useColorContext } from '@project-r/styleguide'
import { getLabel, getTitle } from '../Repo/utils'
import { Phase } from '../Repo/Phases'
import {
  columnDateFormat,
  datePickerFormat,
  getDaysFromUrl,
  getUrlDate,
  getUrlWeekEnd,
  getUrlWeekStart,
  isCurrentWeek,
  now,
  offsetUrlWeek,
  reformatUrlDate
} from './utils'

const reposPerWeek = gql`
  query repoWeek($publishDateRange: RepoPublishDateRange) {
    reposSearch(first: 100, publishDateRange: $publishDateRange) {
      nodes {
        id
        meta {
          publishDate
        }
        latestCommit {
          id
          date
          message
          author {
            name
          }
          document {
            id
            meta {
              template
              title
              series {
                title
              }
              section {
                id
                meta {
                  title
                }
              }
              format {
                id
                meta {
                  title
                }
              }
              dossier {
                id
                meta {
                  title
                }
              }
            }
          }
        }
        currentPhase {
          key
          color
          label
        }
      }
    }
  }
`

const styles = {
  calendar: css({
    display: 'flex',
    minHeight: 500
  }),
  weekday: css({
    flex: 1,
    borderLeftWidth: 1,
    borderLeftStyle: 'solid'
  }),
  repo: css({
    cursor: 'pointer',
    borderWidth: 1,
    borderStyle: 'solid',
    margin: 10,
    padding: 5
  }),
  label: css({
    marginBottom: 15
  }),
  phase: css({
    marginTop: 10
  })
}

const Repo = ({ repo }) => {
  const [colorScheme] = useColorContext()
  const { id, currentPhase } = repo
  const label = getLabel(repo)
  return (
    <Link route='repo/tree' params={{ repoId: id.split('/') }} passHref>
      <div {...styles.repo} {...colorScheme.set('borderColor', 'divider')}>
        {label && (
          <div {...styles.label}>
            <Label>{label}</Label>
          </div>
        )}
        {getTitle(repo)}
        <div {...styles.phase}>
          <Phase phase={currentPhase} />
        </div>
      </div>
    </Link>
  )
}

const WeekDay = ({ weekday: { date, repos } }) => {
  const [colorScheme] = useColorContext()

  return (
    <div {...styles.weekday} {...colorScheme.set('borderLeftColor', 'divider')}>
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

const Calendar = ({
  router: {
    query,
    query: { from = getUrlWeekStart(now), until = getUrlWeekEnd(now) }
  },
  data: { reposSearch: repos }
}) => {
  const [calendar, setCalendar] = useState([])

  useEffect(() => {
    const calendarDays = getDaysFromUrl(from, until).map(date => ({
      date,
      repos: []
    }))

    if (!repos?.nodes) {
      return setCalendar(calendarDays)
    }

    const reposByDay = group(repos.nodes, repo =>
      getUrlDate(new Date(repo.meta.publishDate))
    )
    setCalendar(
      calendarDays.map(day => ({
        ...day,
        repos: reposByDay.get(day.date) || []
      }))
    )
  }, [repos])

  const changeDates = dates =>
    Router.replaceRoute('index', { ...query, ...dates })

  const offsetDates = offset =>
    changeDates({
      from: offsetUrlWeek(from, offset),
      until: offsetUrlWeek(until, offset)
    })

  const resetDates = () =>
    changeDates({
      from: getUrlWeekStart(now),
      until: getUrlWeekEnd(now)
    })
  return (
    <div>
      <span>
        <button onClick={() => offsetDates(-1)}>Previous</button>
        {reformatUrlDate(from, datePickerFormat)} -{' '}
        {reformatUrlDate(until, datePickerFormat)}
        <button onClick={() => offsetDates(1)}>Next</button>
        <button onClick={resetDates}>Reset</button>
        <br />
        <br />
        {isCurrentWeek(from) ? 'current week' : 'other week'}
        <br />
        <br />
      </span>
      <div {...styles.calendar}>
        {calendar.map(day => (
          <WeekDay key={day} weekday={day} />
        ))}
      </div>
    </div>
  )
}

export default compose(
  withRouter,
  graphql(reposPerWeek, {
    options: ({
      router: {
        query: { from, until }
      }
    }) => {
      return {
        fetchPolicy: 'network-only',
        ssr: false,
        notifyOnNetworkStatusChange: true,
        variables: {
          publishDateRange: from &&
            until && {
              from,
              until
            }
        }
      }
    }
  })
)(Calendar)
