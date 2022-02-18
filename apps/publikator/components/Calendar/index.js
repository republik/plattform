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
  offsetUrlWeek,
} from '../../lib/utils/calendar'
import { DateHeading, ReposByTemplate } from './Day'
import { CurrentDates, Nav, NavButton, ResetLink } from './Nav'
import { reposPerWeek } from './graphql'
import { Loader } from '@project-r/styleguide'
import { group } from 'd3-array'

const styles = {
  container: css({
    padding: 20,
    minWidth: 1200,
    maxWidth: 2200,
    overflow: 'scroll',
  }),
  calendar: css({
    marginTop: 15,
    display: 'flex',
    flexDirection: 'column',
  }),
  calendarByTemplate: css({
    display: 'flex',
  }),
  day: css({
    flexGrow: 1,
    flexBasis: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }),
}

const CalendarByTemplate = ({
  template,
  calendar,
  isNewsletter,
  withHeading,
  currentWeek,
}) => {
  return (
    <div {...styles.calendarByTemplate}>
      {calendar.map((day) => {
        const { date, repos } = day
        return (
          <div
            key={date}
            {...styles.day}
            style={{ opacity: isPast(day.date) && currentWeek ? 0.6 : 1 }}
          >
            {withHeading && <DateHeading date={date} />}
            <ReposByTemplate
              repos={repos}
              template={template}
              isNewsletter={isNewsletter}
              date={date}
              isPast={isPast(day.date)}
            />
          </div>
        )
      })}
    </div>
  )
}

const Calendar = ({
  router: {
    query,
    query: { from, until },
  },
  data = {},
}) => {
  useEffect(() => {
    !(from && until) && resetDates()
  }, [])

  const changeDates = (dates) =>
    Router.replaceRoute('index', { ...query, ...dates })

  const offsetDates = (offset) => () =>
    changeDates({
      from: offsetUrlWeek(from, offset),
      until: offsetUrlWeek(until, offset),
    })

  const resetDates = () =>
    changeDates({
      from: getUrlWeekStart(now),
      until: getUrlWeekEnd(now),
    })

  const { loading, error, reposSearch } = data
  const currentWeek = isCurrentWeek(from)

  return (
    <div {...styles.container}>
      <Nav>
        <NavButton goBack={offsetDates(-1)} />
        <CurrentDates from={from} until={until} />
        <NavButton goForth={offsetDates(1)} />
        {!currentWeek && <ResetLink reset={resetDates} />}
      </Nav>
      <Loader
        loading={loading}
        error={error}
        height={300}
        render={() => {
          const reposByTemplate = group(reposSearch?.nodes || [], (repo) =>
            repo.latestCommit.document.meta.template === 'editorialNewsletter'
              ? 'newsletter'
              : 'other',
          )
          const newslettersCalendar = getPublicationCalendar(
            from,
            until,
            reposByTemplate.get('newsletter'),
          )
          const articlesCalendar = getPublicationCalendar(
            from,
            until,
            reposByTemplate.get('other'),
          )
          return (
            <div {...styles.calendar}>
              <CalendarByTemplate
                template='newsletters'
                calendar={newslettersCalendar}
                isNewsletter
                withHeading
                currentWeek={currentWeek}
              />
              <CalendarByTemplate
                template='articles'
                calendar={articlesCalendar}
                currentWeek={currentWeek}
              />
            </div>
          )
        }}
      />
    </div>
  )
}

export default compose(
  withRouter,
  graphql(reposPerWeek, {
    options: ({
      router: {
        query: { from, until },
      },
    }) => ({
      fetchPolicy: 'network-only',
      variables: {
        publishDateRange: {
          from,
          until,
        },
      },
    }),
    skip: ({
      router: {
        query: { from, until },
      },
    }) => !from || !until,
  }),
)(Calendar)
