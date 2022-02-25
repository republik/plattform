import React from 'react'
import compose from 'lodash/flowRight'
import { sum } from 'd3-array'

import { Editorial, Chart, ChartTitle, ChartLead } from '@project-r/styleguide'

import voteT from './voteT'
import { countFormat, swissNumbers } from '../../lib/utils/format'
import withT from '../../lib/withT'
import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'
import Loader from '../Loader'

const votingQuery = gql`
  query votingResults($slug: String!) {
    voting(slug: $slug) {
      id
      description
      allowEmptyBallots
      turnout {
        eligible
        submitted
      }
      result {
        options {
          count
          winner
          option {
            id
            label
          }
        }
      }
    }
  }
`

const percentFormat = swissNumbers.format('.1%')

const VOTE_BAR_CONFIG = {
  type: 'Bar',
  numberFormat: '.1%',
  color: 'option',
  colorSort: 'none',
  colorRange: 'diverging1',
  highlight: 'true',
  sort: 'none',
  inlineValue: true,
  inlineLabel: 'option',
  inlineSecondaryLabel: 'votes',
}

const VoteResult = compose(
  voteT,
  withT,
)(({ data, vt, t, options = {}, messages = {} }) => {
  const results = data.result.options.filter((result) => result.option)
  const winner = results.find((result) => result.winner)
  const filledCount = sum(results, (r) => r.count)
  const values = results.map((result) => ({
    value: String(result.count / filledCount),
    option: vt(`vote/voting/option${result.option.label}`),
    votes: messages.chartLabelVotes
      ? messages.chartLabelVotes.replace(
          '{formattedCount}',
          countFormat(result.count),
        )
      : vt('vote/votes', {
          formattedCount: countFormat(result.count),
        }),
  }))
  const empty = data.result.options.find((result) => !result.option)
  const emptyVotes = empty ? empty.count : 0
  const { eligible, submitted } = data.turnout

  return (
    <div>
      <ChartTitle>{messages.description || data.description}</ChartTitle>
      {!options.hideChartLead && !!winner && (
        <ChartLead>
          {messages.chartLead
            ? messages.chartLead.replace(
                '{formattedPercent}',
                percentFormat(winner.count / filledCount),
              )
            : vt(`vote/voting/winner/${winner.option.label}`, {
                formattedPercent: percentFormat(winner.count / filledCount),
              })}
        </ChartLead>
      )}
      <Chart t={t} config={VOTE_BAR_CONFIG} values={values} />
      <Editorial.Note style={{ marginTop: 10 }}>
        {messages.footnote
          ? messages.footnote
              .replace(
                '{formattedPercent}',
                percentFormat(submitted / eligible),
              )
              .replace(
                '{formattedCount}',
                countFormat(emptyVotes + filledCount),
              )
              .replace('{formattedEmptyCount}', countFormat(emptyVotes))
          : vt(
              `vote/voting/turnout/${
                data.allowEmptyBallots ? 'withEmpty' : 'withoutEmpty'
              }`,
              {
                formattedPercent: percentFormat(submitted / eligible),
                formattedCount: countFormat(emptyVotes + filledCount),
                formattedEmptyCount: countFormat(emptyVotes),
              },
            )}
      </Editorial.Note>
    </div>
  )
})

const VoteResultLoader = graphql(votingQuery)(({ data, options, messages }) => (
  <Loader
    loading={data.loading}
    error={data.error}
    render={() => (
      <VoteResult data={data.voting} options={options} messages={messages} />
    )}
  />
))

export default VoteResultLoader
