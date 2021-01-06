import React, { useEffect } from 'react'
import { css } from 'glamor'
import { compose, graphql } from 'react-apollo'
import { withRouter } from 'next/router'
import { Router } from '../../lib/routes'
import {
  getPublicationCalendar,
  getUrlWeekEnd,
  getUrlWeekStart,
  isCurrentWeek,
  isPast,
  now,
  offsetUrlWeek
} from '../../lib/utils/calendar'
import Day from './Day'
import { CurrentDates, Nav, NavButton, ResetLink } from './Nav'
import { reposPerWeek } from './graphql'
import { Loader } from '@project-r/styleguide'

const styles = {
  container: css({
    padding: 20,
    minWidth: 1200,
    maxWidth: 2200,
    overflow: 'scroll'
  }),
  calendar: css({
    display: 'flex',
    minHeight: 'calc(100vh - 210px)',
    marginTop: 15
  })
}

const Calendar = ({
  router: {
    query,
    query: { from, until }
  },
  data: { loading, error, reposSearch }
}) => {
  useEffect(() => {
    !(from && until) && resetDates()
  }, [])

  const changeDates = dates =>
    Router.replaceRoute('index', { ...query, ...dates })

  const offsetDates = offset => () =>
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
    <div {...styles.container}>
      <Nav>
        <NavButton goBack={offsetDates(-1)} />
        <CurrentDates from={from} until={until} />
        <NavButton goForth={offsetDates(1)} />
        {!isCurrentWeek(from) && <ResetLink reset={resetDates} />}
      </Nav>
      <div {...styles.calendar}>
        <Loader
          loading={true}
          error={error}
          height={300}
          render={() => {
            const calendar = getPublicationCalendar(
              from,
              until,
              reposSearch?.nodes || []
            )
            return (
              <>
                {calendar.map(day => (
                  <Day
                    key={day.date}
                    day={day}
                    isPast={isPast(day.date)}
                    discrete={isPast(day.date) && isCurrentWeek(from)}
                  />
                ))}
              </>
            )
          }}
        />
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
    }) => ({
      fetchPolicy: 'network-only',
      variables: {
        publishDateRange: {
          from,
          until
        }
      }
    }),
    skip: ({
      router: {
        query: { from, until }
      }
    }) => !from || !until
  })
)(Calendar)
