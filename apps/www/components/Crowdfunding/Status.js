import { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { ascending } from 'd3-array'
import { timeMinute } from 'd3-time'

import withT from '../../lib/withT'
import { chfFormat, countFormat } from '../../lib/utils/format'

import { STATUS_POLL_INTERVAL_MS } from '../../lib/constants'

import {
  P,
  Label,
  fontStyles,
  mediaQueries,
  pxToRem,
  Interaction,
} from '@project-r/styleguide'

import Bar from './Bar'

const styles = {
  primaryNumber: css({
    display: 'block',
    marginBottom: -3,
    [mediaQueries.mUp]: {
      marginBottom: -8,
    },
    fontSize: 80,
    ...fontStyles.sansSerifRegular,
    lineHeight: 1,
  }),
  secondaryNumber: css({
    display: 'block',
    [mediaQueries.mUp]: {
      marginBottom: -3,
    },
    fontSize: 43,
    ...fontStyles.sansSerifRegular,
    lineHeight: 1,
  }),
  smallNumber: css({
    display: 'block',
    [mediaQueries.mUp]: {
      marginBottom: -3,
    },
    fontSize: 22,
    ...fontStyles.sansSerifRegular,
    lineHeight: 1,
  }),
  label: css(Interaction.fontRule, {
    display: 'block',
    fontSize: pxToRem(14),
    lineHeight: pxToRem(20),
    paddingTop: 5,
    paddingBottom: 5,
    [mediaQueries.mUp]: {
      paddingTop: 8,
    },
  }),
  hoverGoal: css({
    cursor: 'default',
    ...fontStyles.sansSerifMedium,
  }),
}

class Status extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }
  tick() {
    const now = new Date()

    const msLeft = 1000 - now.getMilliseconds() + 50
    let msToNextTick = (60 - now.getSeconds()) * 1000 + msLeft

    const endDate = this.props.endDate || this.props.crowdfunding.endDate
    if (endDate) {
      const end = new Date(endDate)
      if (end < now) {
        return
      }
      const totalMinutes = timeMinute.count(now, end)
      const hours = Math.floor(totalMinutes / 60) % 24
      if (hours === 0) {
        msToNextTick = msLeft
      }
    }

    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.setState({
        now: new Date(),
      })
      this.tick()
    }, msToNextTick)
  }
  componentDidMount() {
    if (!this.props.compact) {
      this.tick()
    }
  }
  componentWillUnmount() {
    clearTimeout(this.timeout)
  }
  render() {
    if (!this.props.crowdfunding) {
      return null
    }

    const endDate = this.props.endDate || this.props.crowdfunding.endDate
    const {
      crowdfundingName,
      crowdfunding: { goals, status },
      labelReplacements,
      t,
      money,
      people,
      memberships,
      color,
      barColor,
      hasEnd = true,
    } = this.props
    const now = new Date()
    const nextMinute = timeMinute.ceil(new Date())

    // end date is expected to be an exact minute
    // timeMinute.round is used to ensure that and
    // support end dates like '2017-05-31 19:59:59.999+02'
    const end = timeMinute.round(new Date(endDate))

    const totalMinutes = timeMinute.count(nextMinute, end)
    const minutes = totalMinutes % 60
    const hours = Math.floor(totalMinutes / 60) % 24
    const days = Math.floor(totalMinutes / 60 / 24)

    if (!goals.length) {
      return null
    }

    const goalsByPeople = []
      .concat(goals)
      .sort((a, b) => ascending(a.people, b.people))
    const goal = goalsByPeople[goalsByPeople.length - 1]

    const createHoverGoalCount = (format, value) => (
      <a
        key='count'
        {...styles.hoverGoal}
        onTouchStart={(e) => {
          e.preventDefault()
          this.setState({
            showGoal: true,
          })
        }}
        onTouchEnd={() =>
          this.setState({
            showGoal: false,
          })
        }
        onMouseOver={() =>
          this.setState({
            showGoal: true,
          })
        }
        onMouseOut={() =>
          this.setState({
            showGoal: false,
          })
        }
      >
        {format(value)}
      </a>
    )

    const colorStyle = { color }

    if (this.props.compact) {
      const accessor = memberships ? 'memberships' : 'people'
      return (
        <div style={{ paddingTop: 10 }}>
          <P style={colorStyle}>
            <span {...styles.smallNumber}>{countFormat(status[accessor])}</span>
            <span {...styles.label}>
              {t.first.elements(
                [
                  `crowdfunding/status/goal/${crowdfundingName}/${accessor}`,
                  `crowdfunding/status/goal/${accessor}`,
                ],
                {
                  count: createHoverGoalCount(countFormat, goal[accessor]),
                },
              )}
            </span>
          </P>
          {/* <Bar
            goals={goalsByPeople}
            showLast={this.state.showGoal}
            status={status}
            accessor={accessor}
            format={countFormat}
            color={barColor}
          /> */}
        </div>
      )
    }

    const isRunning = minutes >= 0

    return (
      <Fragment>
        {status.current !== undefined && (
          <P style={{ marginBottom: -10, ...colorStyle }}>
            <span {...styles.smallNumber}>
              {t.pluralize('crowdfunding/status/current', {
                count: countFormat(status.current),
              })}
            </span>
            <span
              {...styles.label}
              dangerouslySetInnerHTML={{
                __html: t(
                  'crowdfunding/status/current/label',
                  labelReplacements,
                ),
              }}
            />
          </P>
        )}
        {[
          memberships && {
            accessor: 'memberships',
            format: countFormat,
          },
          people && {
            accessor: 'people',
            format: countFormat,
          },
          money && {
            accessor: 'money',
            format: (value) => chfFormat(value / 100),
          },
        ]
          .filter(Boolean)
          .map(({ accessor, goalAccessor, format }, i) => (
            <Fragment key={accessor}>
              <P style={colorStyle}>
                <span
                  {...styles[i === 0 ? 'primaryNumber' : 'secondaryNumber']}
                >
                  {format(status[accessor])}
                </span>
                <span {...styles.label}>
                  {t.first.elements(
                    [
                      `crowdfunding/status/goal/${crowdfundingName}/${accessor}`,
                      `crowdfunding/status/goal/${accessor}`,
                    ],
                    {
                      count: createHoverGoalCount(
                        format,
                        goal[goalAccessor || accessor],
                      ),
                    },
                  )}
                </span>
              </P>
              {/* <Bar
                goals={goalsByPeople}
                showLast={this.state.showGoal && i === 0}
                status={status}
                accessor={accessor}
                format={format}
                color={barColor}
              /> */}
            </Fragment>
          ))}
        {status.lastSeen !== undefined && (
          <P style={colorStyle}>
            <span {...styles.smallNumber}>
              {t.pluralize('crowdfunding/status/lastSeen', {
                count: countFormat(status.lastSeen),
              })}
            </span>
            <span {...styles.label}>
              {t('crowdfunding/status/lastSeen/label')}
            </span>
          </P>
        )}
        {status.support !== undefined && (
          <P style={colorStyle}>
            <span {...styles.smallNumber}>
              {t.pluralize('crowdfunding/status/support', {
                count: countFormat(status.support),
              })}
            </span>
            <span {...styles.label}>
              {t('crowdfunding/status/support/label')}
            </span>
          </P>
        )}
        {hasEnd && (
          <P style={colorStyle}>
            <span
              {...styles.smallNumber}
              style={isRunning ? undefined : { lineHeight: 1.3 }}
            >
              {isRunning
                ? [
                    days > 0 &&
                      t.pluralize('crowdfunding/status/time/days', {
                        count: days,
                      }),
                    (days !== 0 || hours > 0) &&
                      t.pluralize('crowdfunding/status/time/hours', {
                        count: hours,
                      }),
                    t.pluralize('crowdfunding/status/time/minutes', {
                      count: minutes,
                    }),
                    days === 0 &&
                      hours === 0 &&
                      this.state.now &&
                      t.pluralize('crowdfunding/status/time/seconds', {
                        count: 60 - now.getSeconds(),
                      }),
                  ]
                    .filter(Boolean)
                    .join(' ')
                : t.first([
                    `crowdfunding/status/time/ended/${crowdfundingName}`,
                    'crowdfunding/status/time/ended',
                  ])}
            </span>
            {isRunning ? (
              <span {...styles.label}>
                {t.first([
                  `crowdfunding/status/time/label/${crowdfundingName}`,
                  'crowdfunding/status/time/label',
                ])}
              </span>
            ) : (
              <br />
            )}
          </P>
        )}
      </Fragment>
    )
  }
}

export const RawStatus = Status

RawStatus.propTypes = {
  people: PropTypes.bool,
  memberships: PropTypes.bool,
  money: PropTypes.bool,
  hasEnd: PropTypes.bool,
}

const query = gql`
  query crowdfundingStatus($crowdfundingName: String!) {
    crowdfunding(name: $crowdfundingName) {
      id
      name
      goals {
        people
        money
        memberships
        description
      }
      status {
        people
        money
        memberships
      }
      endDate
      hasEnded
    }
  }
`

export const withStatus = (Component) =>
  graphql(query, {
    skip: (props) => props.crowdfunding || !props.crowdfundingName,
    options: {
      pollInterval: +STATUS_POLL_INTERVAL_MS,
    },
    props: ({ data }) => {
      return {
        crowdfunding: data.crowdfunding,
        statusRefetch: data.refetch,
        statusStartPolling: data.startPolling,
        statusStopPolling: data.stopPolling,
      }
    },
  })(Component)

export default compose(withStatus, withT)(Status)
