//
// IMPORTANT NOTE:
// The birthday/yearOfBirth combo was refactored to birthyear.
// We cleaned up the code but didn't test all the paths.
// Please test & review before the next election!
//

import { useEffect, useMemo, useState } from 'react'
import {
  A,
  Button,
  Interaction,
  RawHtml,
  useColorContext,
} from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css } from 'glamor'
import ElectionBallot from './ElectionBallot'
import voteT from './voteT'
import withMe from '../../lib/apollo/withMe'
import { timeFormat } from '../../lib/utils/format'
import Loader from '../Loader'
import SignIn from '../Auth/SignIn'
import AddressEditor, { withAddressData } from './AddressEditor'
import ElectionConfirm from './ElectionConfirm'
import { Card, sharedStyles } from './text'
import createPersistedState from '../../lib/hooks/use-persisted-state'

const { P } = Interaction

const query = gql`
  query getElection($slug: String!) {
    election(slug: $slug) {
      id
      userIsEligible
      userHasSubmitted
      userSubmitDate
      description
      beginDate
      endDate
      numSeats
      discussion {
        id
        path
        comments {
          id
          totalCount
        }
      }
      candidacies {
        id
        isIncumbent
        city
        recommendation
        comment {
          id
        }
        election {
          slug
          discussion {
            id
          }
        }
        credential {
          id
          description
          verified
        }
        user {
          id
          name
          username
          statement
          portrait
          disclosures
          gender
          birthyear
          biographyContent
          credentials {
            isListed
            description
          }
        }
        postalCodeGeo {
          countryName
          countryCode
          postalCode
          lat
          lon
        }
      }
    }
  }
`

const messageDateFormat = timeFormat('%e. %B %Y')

const styles = {
  wrapper: css({
    width: '100%',
    position: 'relative',
    minHeight: 200,
  }),
  header: css({
    padding: '13px 0',
  }),
  actions: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  message: css({
    padding: 20,
    marginBottom: 20,
    textAlign: 'center',
  }),
}

const sortNames = (c1, c2) => {
  let name1 = c1.user.name.toUpperCase()
  let name2 = c2.user.name.toUpperCase()
  if (name1 < name2) {
    return -1
  }
  if (name1 > name2) {
    return 1
  }
  return 0
}

export const ElectionHeader = ({ children }) => {
  return (
    <div {...styles.header}>
      <P>
        <strong>{children}</strong>
      </P>
    </div>
  )
}

export const ElectionActions = ({ children }) => {
  return (
    <Card style={{ position: 'sticky', bottom: 0, zIndex: 9 }}>
      <div {...styles.actions}>{children}</div>
    </Card>
  )
}

const ElectionAlert = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...styles.wrapper}
      {...colorScheme.set('backgroundColor', 'alert')}
      style={{ marginBottom: 30, padding: 20 }}
    >
      {children}
    </div>
  )
}

const sortCandidates = (candidates) =>
  candidates.sort((c1, c2) => {
    if (
      (c1.recommendation && !c2.recommendation) ||
      (c1.isIncumbent && !c2.isIncumbent)
    ) {
      return -1
    } else if (
      (c2.recommendation && !c1.recommendation) ||
      (c2.isIncumbent && !c1.isIncumbent)
    ) {
      return 1
    } else return sortNames(c1, c2)
  })

export const isSelected = (candidate, vote) =>
  vote.find((v) => v === candidate.id)

const Election = compose(
  voteT,
  withMe,
  withAddressData,
)(
  ({
    election,
    vt,
    addressData,
    me,
    discussionTag,
    mandatoryCandidates,
    showMeta,
  }) => {
    const electionId = election.id
    const useGenElection = useMemo(
      () => createPersistedState(`republik-election-${electionId}`),
      [electionId],
    )
    const [rawVote, setRawVote] = useGenElection()
    const vote = useMemo(() => rawVote || [], [rawVote])
    const setVote = (ids) => {
      setRawVote(ids?.length ? ids : undefined)
    }
    const [isDirty, setDirty] = useState(false)
    const [isConfirm, setConfirm] = useState(false)

    useEffect(() => {
      setDirty(vote.length > 0)
    }, [vote])

    const toggleCandidate = (candidate) => {
      if (election.numSeats === 1) {
        return setVote([candidate.id])
      }
      setVote(
        isSelected(candidate, vote)
          ? vote.filter((v) => v !== candidate.id)
          : vote.concat(candidate.id),
      )
    }

    const resetVote = (event) => {
      if (event) {
        event.preventDefault()
      }
      setVote([])
      setConfirm(false)
    }

    let dangerousDisabledHTML
    let showSignIn
    if (election.userHasSubmitted) {
      dangerousDisabledHTML = vt('vote/voting/thankyou', {
        submissionDate: messageDateFormat(new Date(election.userSubmitDate)),
      })
    } else if (Date.now() > new Date(election.endDate)) {
      dangerousDisabledHTML = vt('vote/election/ended')
    } else if (!me) {
      dangerousDisabledHTML = vt('vote/election/notSignedIn', {
        beginDate: timeFormat('%d.%m.%Y')(new Date(election.beginDate)),
      })
      showSignIn = true
    } else if (!election.userIsEligible) {
      dangerousDisabledHTML = vt('vote/election/notEligible')
    }

    if (election.userIsEligible && !addressData.voteMe?.address) {
      return <AddressEditor />
    }

    const { numSeats } = election
    const givenVotes = vote.length
    const remainingVotes = numSeats - givenVotes

    const electionOpen = !dangerousDisabledHTML
    const showHeader = electionOpen && numSeats > 1

    const candidates = sortCandidates([...election.candidacies])

    return (
      <div {...styles.wrapper}>
        {isConfirm ? (
          <ElectionConfirm
            election={election}
            candidates={candidates}
            vote={vote}
            resetVote={resetVote}
            goBack={(e) => {
              e?.preventDefault()
              setConfirm(false)
            }}
          />
        ) : (
          <>
            {showHeader && (
              <ElectionHeader>
                {vt('vote/election/votesAvailable', {
                  count: numSeats,
                })}
              </ElectionHeader>
            )}
            {dangerousDisabledHTML && (
              <ElectionAlert>
                <div {...styles.message}>
                  <RawHtml
                    type={P}
                    dangerouslySetInnerHTML={{
                      __html: dangerousDisabledHTML,
                    }}
                  />
                </div>
                {showSignIn && <SignIn />}
              </ElectionAlert>
            )}
            <div {...styles.wrapper}>
              <ElectionBallot
                candidates={candidates}
                vote={vote}
                onChange={electionOpen ? toggleCandidate : undefined}
                maxVotes={election.numSeats}
                mandatory={mandatoryCandidates}
                showMeta={showMeta}
                discussionPath={election?.discussion?.path}
                discussionTag={discussionTag}
                disabled={remainingVotes <= 0}
              />
              {electionOpen && (
                <ElectionActions>
                  <div {...sharedStyles.buttons}>
                    <Button primary onClick={() => setConfirm(true)}>
                      {vt('vote/common/continue')}
                    </Button>
                    {isDirty && (
                      <Interaction.P style={{ marginLeft: 30 }}>
                        <A href='#' onClick={resetVote}>
                          {vt('vote/common/reset')}
                        </A>
                      </Interaction.P>
                    )}
                  </div>
                  <div {...sharedStyles.hint}>
                    {!remainingVotes
                      ? vt('vote/election/noVotesRemaining')
                      : remainingVotes === numSeats
                      ? vt('vote/common/help/blank')
                      : vt('vote/election/votesRemaining', {
                          count: remainingVotes,
                          max: numSeats,
                        })}
                  </div>
                </ElectionActions>
              )}
            </div>
          </>
        )}
      </div>
    )
  },
)

const ElectionLoader = compose(
  graphql(query, {
    options: ({ slug }) => ({
      variables: {
        slug,
      },
    }),
  }),
)(({ data, discussionTag, mandatoryCandidates = [], showMeta = true }) => (
  <Loader
    loading={data.loading}
    error={data.error}
    render={() => {
      if (!data?.election?.candidacies?.length) return null
      return (
        <Election
          election={data.election}
          discussionTag={discussionTag}
          mandatoryCandidates={mandatoryCandidates}
          showMeta={showMeta}
        />
      )
    }}
  />
))

export default ElectionLoader
