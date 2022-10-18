import { Fragment, useState } from 'react'
import { css } from 'glamor'
import {
  A,
  Button,
  InlineSpinner,
  Interaction,
  Radio,
  RawHtml,
  withMe,
} from '@project-r/styleguide'
import { timeFormat } from '../../lib/utils/format'
import voteT from './voteT'
import { gql } from '@apollo/client'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import ErrorMessage from '../ErrorMessage'
import AddressEditor, { withAddressData } from './AddressEditor'
import SignIn from '../Auth/SignIn'
import { NarrowCard, sharedStyles } from './text'
import Loader from '../Loader'

const { P } = Interaction

const submitVotingBallotMutation = gql`
  mutation submitVotingBallot($votingId: ID!, $optionId: ID) {
    submitVotingBallot(votingId: $votingId, optionId: $optionId) {
      id
      userHasSubmitted
      userSubmitDate
    }
  }
`

const query = gql`
  query getVoting($slug: String!) {
    voting(slug: $slug) {
      id
      description
      slug
      beginDate
      endDate
      userSubmitDate
      userHasSubmitted
      userIsEligible
      requireAddress
      allowEmptyBallots
      options {
        id
        label
      }
    }
  }
`

const styles = {
  message: css({
    padding: 20,
    marginBottom: 20,
    textAlign: 'center',
  }),
  confirm: css({
    margin: '10px 0 15px',
  }),
  buttons: css({
    padding: '15px 0',
  }),
}

const messageDateFormat = timeFormat('%e. %B %Y')

const Voting = compose(
  voteT,
  withMe,
  graphql(submitVotingBallotMutation, {
    props: ({ mutate }) => ({
      submitVotingBallot: (votingId, optionId) => {
        return mutate({
          variables: {
            votingId,
            optionId,
          },
        })
      },
    }),
  }),
  withAddressData,
)(
  ({
    voting,
    submitVotingBallot,
    me,
    addressData,
    vt,
    description,
    messages = {},
  }) => {
    const [selectedValue, setSelectedValue] = useState(null)
    const [isConfirm, setConfirm] = useState(false)
    const [isUpdating, setUpdating] = useState(false)
    const [error, setError] = useState(null)

    const reset = (e) => {
      e.preventDefault()
      setSelectedValue(null)
      setError(null)
      setConfirm(false)
    }

    const vote = () => {
      setUpdating(true)
      submitVotingBallot(voting.id, selectedValue)
        .then(() => {
          setUpdating(false)
          setError(null)
        })
        .catch((error) => {
          setUpdating(false)
          setError(error)
        })
    }

    let dangerousDisabledHTML
    let showSignIn
    if (voting.userHasSubmitted) {
      dangerousDisabledHTML =
        messages.thankyou ||
        vt('vote/voting/thankyou', {
          submissionDate: messageDateFormat(new Date(voting.userSubmitDate)),
        })
    } else if (Date.now() > new Date(voting.endDate)) {
      dangerousDisabledHTML = messages.ended || vt('vote/voting/ended')
    } else if (!me) {
      dangerousDisabledHTML =
        messages.notSignedIn ||
        vt('vote/voting/notSignedIn', {
          beginDate: timeFormat('%d.%m.%Y')(new Date(voting.beginDate)),
        })
      showSignIn = true
    } else if (!voting.userIsEligible) {
      dangerousDisabledHTML =
        messages.notEligible || vt('vote/voting/notEligible')
    }

    if (
      voting.userIsEligible &&
      voting.requireAddress &&
      !addressData.voteMe?.address
    ) {
      return <AddressEditor />
    }

    if (dangerousDisabledHTML) {
      return (
        <NarrowCard>
          <div {...styles.message}>
            <RawHtml
              type={P}
              dangerouslySetInnerHTML={{
                __html: dangerousDisabledHTML,
              }}
            />
          </div>
          {showSignIn && <SignIn />}
        </NarrowCard>
      )
    }

    const choice = (
      <>
        <div {...styles.buttons}>
          {voting.options.map(({ id, label }) => (
            <Fragment key={id}>
              <Radio
                value={id}
                checked={id === selectedValue}
                disabled={!!isUpdating}
                onChange={() => {
                  setSelectedValue(id)
                  setError(null)
                }}
              >
                <span style={{ marginRight: 30 }}>
                  {vt(`vote/voting/option${label}`)}
                </span>
              </Radio>
            </Fragment>
          ))}
        </div>
        <div {...sharedStyles.buttons}>
          <Button
            primary={voting.allowEmptyBallots || selectedValue !== null}
            onClick={() => {
              if (!voting.allowEmptyBallots && selectedValue === null) {
                setError(vt('vote/voting/empty/error'))
              } else {
                setConfirm(true)
              }
            }}
          >
            {vt('vote/common/continue')}
          </Button>
          {voting.allowEmptyBallots && selectedValue !== null && (
            <Interaction.P style={{ marginLeft: 30 }}>
              <A href='#' onClick={reset}>
                {vt(`vote/common/${isConfirm ? 'back' : 'reset'}`)}
              </A>
            </Interaction.P>
          )}
        </div>
        {voting.allowEmptyBallots && (
          <div {...sharedStyles.hint}>{vt('vote/common/help/blank')}</div>
        )}
      </>
    )

    const confirmKey = selectedValue ? 'confirmAnswer' : 'confirmEmpty'
    const confirmation = (
      <>
        <div {...styles.confirm}>
          <P>
            {(messages[confirmKey] || vt(`vote/voting/${confirmKey}`)).replace(
              '{answer}',
              selectedValue
                ? vt(
                    `vote/voting/option${
                      voting.options.find((o) => o.id === selectedValue).label
                    }`,
                  )
                : '',
            )}{' '}
          </P>
        </div>
        <div {...sharedStyles.buttons}>
          <div style={{ marginRight: 15 }}>
            <Button disabled={isUpdating} onClick={reset}>
              {vt('vote/common/back')}
            </Button>
          </div>
          <Button primary onClick={vote}>
            {isUpdating ? (
              <InlineSpinner size={40} />
            ) : (
              messages.labelVote || vt('vote/voting/labelVote')
            )}
          </Button>
        </div>
        <div {...sharedStyles.hint}>
          {messages.final || vt('vote/common/help/final')}
        </div>
      </>
    )

    return (
      <NarrowCard>
        <P>
          <strong>{description || voting.description}</strong>
        </P>
        {error && <ErrorMessage error={error} />}
        {isConfirm ? confirmation : choice}
      </NarrowCard>
    )
  },
)

const VotingLoader = compose(
  graphql(query, {
    options: ({ slug }) => ({
      variables: {
        slug,
      },
    }),
  }),
)(({ data, description, messages }) => (
  <Loader
    loading={data.loading}
    error={data.error}
    render={() => {
      if (!data.voting) return null
      return (
        <Voting
          voting={data.voting}
          description={description}
          messages={messages}
        />
      )
    }}
  />
))

export default VotingLoader
