import React, { useEffect, useState } from 'react'
import gql from 'graphql-tag'
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
} from './utils'
import Day from './Day'
import { CurrentDates, Nav, NavButton, ResetLink } from './Nav'

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
  data
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

  const calendar = getPublicationCalendar(
    from,
    until,
    data?.reposSearch?.nodes || []
  )

  return (
    <div {...styles.container}>
      <Nav>
        <NavButton goBack={offsetDates(-1)} />
        <CurrentDates from={from} until={until} />
        <NavButton goForth={offsetDates(1)} />
        {!isCurrentWeek(from) && <ResetLink reset={resetDates} />}
      </Nav>
      <div {...styles.calendar}>
        {calendar.map(day => (
          <Day
            key={day.date}
            day={day}
            isPast={isCurrentWeek(from) && isPast(day.date)}
          />
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
