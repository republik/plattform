import { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { Checkbox, colors, A } from '@project-r/styleguide'
import { getName } from '../../lib/utils/name'
import { swissTime } from '../../lib/utils/format'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import Link from 'next/link'
import Loader from '../Loader'
import withT from '../../lib/withT'
import * as fragments from '../../lib/graphql/fragments'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const placeMilestone = gql`
  mutation placeMilestone(
    $repoId: ID!
    $commitId: ID!
    $name: String!
    $message: String!
  ) {
    placeMilestone(
      repoId: $repoId
      commitId: $commitId
      name: $name
      message: $message
    ) {
      ...MilestoneWithCommit
    }
  }
  ${fragments.MilestoneWithCommit}
`

const removeMilestone = gql`
  mutation removeMilestone($repoId: ID!, $name: String!) {
    removeMilestone(repoId: $repoId, name: $name)
  }
`

export const getMilestones = gql`
  query repoMilestones($repoId: ID!) {
    repo(id: $repoId) {
      id
      milestones {
        ...MilestoneWithCommit
      }
      currentPhase {
        key
        color
        label
      }
    }
  }
  ${fragments.MilestoneWithCommit}
`

const styles = {
  approvedBy: css({
    clear: 'left',
    display: 'block',
    fontSize: '11px',
    lineHeight: '1.3em',
  }),
  commit: css({
    borderTop: `1px solid ${colors.divider}`,
    display: 'block',
    fontSize: '11px',
    marginTop: '3px',
    paddingTop: '3px',
  }),
}

const checklistMilestones = [
  'startCreation',
  'startTC',
  'finalEditing',
  'startCR',
  'startProduction',
  'startProofReading',
  'proofReadingOk',
  'numbersOk',
  'imagesOk',
  'factCheckOk',
  'finalControl',
]

class Checklist extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mutating: {},
    }
  }

  render() {
    const {
      loading,
      error,
      repoId,
      milestones,
      t,
      placeMilestone,
      removeMilestone,
      disabled,
    } = this.props
    const { mutating } = this.state
    return (
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const allMilestones = checklistMilestones.map((name) => ({
            name,
            ...milestones.find((m) => m.name === name),
          }))

          return (
            <div>
              {allMilestones.map(({ name, author, commit }) => (
                <p key={name}>
                  <Checkbox
                    checked={!!author}
                    disabled={disabled || mutating[name]}
                    onChange={(_, checked) => {
                      this.setState((state) => ({
                        mutating: {
                          ...state.mutating,
                          [name]: true,
                        },
                      }))
                      const finish = () => {
                        this.setState((state) => ({
                          mutating: {
                            ...state.mutating,
                            [name]: false,
                          },
                        }))
                      }
                      checked
                        ? placeMilestone({
                            name,
                            message: ' ', // ToDo: consider prompting for message
                          }).then(finish)
                        : removeMilestone({
                            name,
                          }).then(finish)
                    }}
                  >
                    {t(`checklist/labels/${name}`, undefined, name)}
                    {!!author && (
                      <span {...styles.approvedBy}>
                        {t('checklist/approvedFor', { name: getName(author) })}
                      </span>
                    )}
                  </Checkbox>
                  {!!commit && (
                    <span {...styles.commit}>
                      <Link
                        href={{
                          pathname: `/repo/${repoId}/edit`,
                          query: { commitId: commit.id },
                        }}
                        passHref
                        legacyBehavior
                      >
                        <A>{commit.message}</A>
                      </Link>

                      {getName(author) !== getName(commit.author) && (
                        <span>
                          <br />
                          {getName(commit.author)}
                        </span>
                      )}
                      <br />
                      {timeFormat(new Date(commit.date))}
                    </span>
                  )}
                </p>
              ))}
            </div>
          )
        }}
      />
    )
  }
}

Checklist.propTypes = {
  repoId: PropTypes.string.isRequired,
  commitId: PropTypes.string.isRequired,
}

export default compose(
  withT,
  graphql(getMilestones, {
    props: ({ data, ownProps: { name } }) => ({
      loading: data.loading,
      error: data.error,
      milestones: data.repo && data.repo.milestones,
    }),
  }),
  graphql(placeMilestone, {
    props: ({ mutate, ownProps: { repoId, commitId } }) => ({
      placeMilestone: ({ name, message }) =>
        mutate({
          variables: {
            repoId,
            commitId,
            name,
            message,
          },
          update: (proxy, { data: { placeMilestone } }) => {
            const variables = {
              repoId,
            }
            const data = proxy.readQuery({
              query: getMilestones,
              variables,
            })
            proxy.writeQuery({
              query: getMilestones,
              variables,
              data: {
                ...data,
                repo: {
                  ...data.repo,
                  milestones: data.repo.milestones.concat(placeMilestone),
                },
              },
            })
          },
          refetchQueries: [
            {
              query: getMilestones,
              variables: {
                repoId,
              },
            },
          ],
        }),
    }),
  }),
  graphql(removeMilestone, {
    props: ({ mutate, ownProps: { repoId } }) => ({
      removeMilestone: ({ name, message }) =>
        mutate({
          variables: {
            repoId: repoId,
            name,
          },
          update: (proxy, { data: { removeMilestone } }) => {
            const variables = {
              repoId,
            }
            const data = proxy.readQuery({
              query: getMilestones,
              variables,
            })
            proxy.writeQuery({
              query: getMilestones,
              variables,
              data: {
                ...data,
                repo: {
                  ...data.repo,
                  milestones: removeMilestone
                    ? data.repo.milestones.filter(
                        (milestone) => milestone.name !== name,
                      )
                    : data.repo.milestones,
                },
              },
            })
          },
          refetchQueries: [
            {
              query: getMilestones,
              variables: {
                repoId,
              },
            },
          ],
        }),
    }),
  }),
)(Checklist)
