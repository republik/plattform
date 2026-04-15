import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Interaction,
  InlineSpinner,
  FigureImage,
  Figure,
  useHeaderHeight,
} from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css } from 'glamor'
import voteT from './voteT'
import ErrorMessage from '../ErrorMessage'
import { ElectionActions, isSelected } from './Election'
import { sharedStyles } from './text'
import { ElectionDiversity } from './ElectionDiversity'
const { P } = Interaction

const submitElectionBallotMutation = gql`
  mutation submitElectionBallot($electionId: ID!, $candidacyIds: [ID!]!) {
    submitElectionBallot(electionId: $electionId, candidacyIds: $candidacyIds) {
      id
      userHasSubmitted
      userSubmitDate
    }
  }
`

const emptyGifLink =
  'https://cdn.repub.ch/s3/republik-assets/assets/vote/empty.gif'

const styles = {
  confirm: css({
    textAlign: 'center',
    width: '80%',
    margin: '10px auto 15px auto',
  }),
}

const ElectionConfirm = compose(
  voteT,
  graphql(submitElectionBallotMutation, {
    props: ({ mutate }) => ({
      submitElectionBallot: (electionId, candidacyIds) => {
        return mutate({
          variables: {
            electionId,
            candidacyIds,
          },
        })
      },
    }),
  }),
)(
  ({
    election,
    candidates,
    vote,
    submitElectionBallot,
    resetVote,
    goBack,
    vt,
  }) => {
    const [isUpdating, setUpdating] = useState(false)
    const [error, setError] = useState(null)
    const ref = useRef()
    const headerHeight = useHeaderHeight()

    useEffect(() => {
      const { top } = ref.current.getBoundingClientRect()
      const { pageYOffset } = window
      const target = pageYOffset + top - headerHeight - 80
      window.scroll(0, target)
    }, [])

    const selectedCandidates = candidates.filter((candidate) =>
      isSelected(candidate, vote),
    )

    const submitBallot = async () => {
      setUpdating(true)
      await submitElectionBallot(election.id, vote)
        .then(() => {
          setUpdating(false)
          setError(null)
          resetVote()
        })
        .catch((error) => {
          setUpdating(false)
          setError(error)
        })
    }

    const { numSeats } = election
    const givenVotes = vote.length
    const remainingVotes = numSeats - givenVotes

    const confirmation = (
      <P {...styles.confirm}>
        {givenVotes < numSeats
          ? vt.pluralize('vote/election/labelConfirmCount', {
              count: givenVotes,
              numSeats,
              remaining: remainingVotes,
            })
          : vt.pluralize('vote/election/labelConfirmAll', {
              numSeats,
              count: givenVotes,
            })}
      </P>
    )

    const actions = (
      <div {...sharedStyles.buttons}>
        <div style={{ marginRight: 15 }}>
          <Button disabled={isUpdating} onClick={goBack}>
            {vt('vote/common/back')}
          </Button>
        </div>
        <Button primary onClick={submitBallot}>
          {isUpdating ? (
            <InlineSpinner size={40} />
          ) : (
            vt('vote/election/labelConfirm')
          )}
        </Button>
      </div>
    )

    return (
      <ElectionActions>
        <div ref={ref} {...styles.confirm}>
          {!givenVotes ? (
            <Figure>
              <FigureImage src={emptyGifLink} maxWidth={500} alt='Leer' />
            </Figure>
          ) : (
            <ElectionDiversity
              title={vt('vote/election/confirm/header')}
              isElected={false}
              members={selectedCandidates}
            />
          )}
        </div>
        {error && <ErrorMessage error={error} />}
        {confirmation}
        {actions}
        <div {...sharedStyles.hint}>{vt('vote/common/help/final')}</div>
      </ElectionActions>
    )
  },
)

export default ElectionConfirm
