import { useState, useEffect } from 'react'
import { withRouter } from 'next/router'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

import {
  Loader,
  Interaction,
  A,
  InlineSpinner,
  Button,
  RawHtml,
} from '@project-r/styleguide'

import withT from '../../lib/withT'

import ErrorMessage from '../ErrorMessage'

import Portrait from './Form/Portrait'
import Details from './Form/Details'
import Statement from './Form/Statement'
import CampaignBudget from './Form/CampaignBudget'
import VestedInterests from './Form/VestedInterests'
import Financing from './Form/Financing'
import { styles as formStyles } from './Form/styles'
import { scrollTop } from '../../lib/utils/link'
import Link from 'next/link'

const { H1, H2, P } = Interaction

const maybeCard = (data, apply) => {
  return (
    data.me &&
    data.me.cards.nodes.length > 0 &&
    data.me.cards.nodes[0] &&
    apply(data.me.cards.nodes[0])
  )
}

const initialVestedInterests = (data) => {
  const records =
    maybeCard(data, (card) => card.payload.vestedInterests) ||
    maybeCard(data, (card) => card.payload.vestedInterestsSmartvote) ||
    []

  return records.map((vestedInterest, index) => ({
    id: `interest${index}`,
    ...vestedInterest,
  }))
}

const Update = (props) => {
  const {
    data,
    t,
    router: {
      query: { locale },
    },
  } = props

  const statementId = maybeCard(
    data,
    (card) => card.statement && card.statement.id,
  )
  const group = maybeCard(data, (card) => card.group)
  const [portrait, setPortrait] = useState({ values: {} })
  const [statement, setStatement] = useState({
    value: maybeCard(data, (card) => card.payload.statement) || '',
  })
  const [budget, setBudget] = useState(() => ({
    value: maybeCard(data, (card) => card.payload.campaignBudget),
  }))
  const [budgetComment, setBudgetComment] = useState(() => ({
    value: maybeCard(data, (card) => card.payload.campaignBudgetComment),
  }))
  const [vestedInterests, setVestedInterests] = useState(() => ({
    value: initialVestedInterests(data),
  }))
  const payloadFinancing =
    maybeCard(data, (card) => card.payload.financing) || {}
  const hasPayloadFinancingValues = Object.keys(payloadFinancing).length

  const [financing, setFinancing] = useState({ value: payloadFinancing })
  const [showErrors, setShowErrors] = useState(false)
  const [serverError, setServerError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [autoUpdateCard, setAutoUpdateCard] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const [financingExpanded, setFinancingExpanded] = useState(
    !hasPayloadFinancingValues,
  )

  useEffect(() => {
    if (autoUpdateCard) {
      setShowErrors(true)

      if (errorMessages.length === 0) {
        setLoading(true)

        props
          .updateCard({
            id: card.id,
            portrait: portrait.values.portrait,
            statement: statement.value,
            payload: { financing: financing.value },
          })
          .then(() => {
            setIsDirty(false)
            setLoading(false)
            setFinancingExpanded(false)
            scrollTop()
          })
          .catch(catchError)
      }

      setAutoUpdateCard(false)
    }
  }, [autoUpdateCard])

  if (data.loading || data.error) {
    return <Loader loading={data.loading} error={data.error} />
  }

  const { me } = data
  if (!me || me.cards.nodes.length === 0) {
    return (
      <>
        <H2 {...formStyles.heading}>
          {t('components/Card/Update/nothing/title')}
        </H2>
        <P {...formStyles.paragraph}>
          {t('components/Card/Update/nothing/lead')}
        </P>
        <P {...formStyles.paragraph}>
          <RawHtml
            dangerouslySetInnerHTML={{
              __html: t('components/Card/Update/nothing/help'),
            }}
          />
        </P>
      </>
    )
  }

  const [card] = me.cards.nodes

  const handlePortrait = ({ values, errors }) => {
    setIsDirty(true)
    setPortrait({
      values,
      errors,
    })
  }

  const handleStatement = (value, shouldValidate) => {
    setIsDirty(true)
    setStatement({
      ...statement,
      value,
      error: value.trim().length <= 0 && 'Statement fehlt',
      dirty: shouldValidate,
    })
  }

  const handleBudget = (value, shouldValidate) => {
    setBudget({
      ...budget,
      value: String(value).replace(/[^0-9]/g, ''),
      error: false,
      dirty: shouldValidate,
    })
  }

  const handleBudgetComment = (value, shouldValidate) => {
    setBudgetComment({
      ...budgetComment,
      value,
      error: false,
      dirty: shouldValidate,
    })
  }

  const handleVestedInterests = (value, shouldValidate) => {
    setVestedInterests({
      ...vestedInterests,
      value,
      error: false,
      dirty: shouldValidate,
    })
  }

  const handleFinancing = (value, shouldValidate) => {
    setFinancing({
      ...financing,
      value,
      error: false,
      dirty: shouldValidate,
    })
  }

  const updateCard = (e) => {
    e && e.preventDefault && e.preventDefault()

    handleStatement(statement.value, true)
    handlePortrait(portrait)
    handleBudget(budget.value, true)
    handleBudgetComment(budgetComment.value, true)
    handleFinancing(financing.value, true)

    setAutoUpdateCard(true)
  }

  const catchError = (error) => {
    setServerError(error)
    setLoading(false)
  }

  const findErrorMessages = () => {
    return [
      portrait.errors && portrait.errors.portrait,
      portrait.errors && portrait.errors.portraitPreview,
      statement.error,
      budget.error,
      budgetComment.error,
      vestedInterests.error,
    ].filter(Boolean)
  }

  const errorMessages = findErrorMessages()

  const titleBaseKey = `components/Card/Update${
    hasPayloadFinancingValues ? '/financing' : ''
  }`

  return <>
    <H1 {...formStyles.heading}>{t(`${titleBaseKey}/title`)}</H1>
    <P {...formStyles.paragraph}>
      <RawHtml
        dangerouslySetInnerHTML={{
          __html: t(`${titleBaseKey}/lead`),
        }}
      />
    </P>

    <P {...formStyles.paragraph}>
      <Link href='/' passHref legacyBehavior>
        <Button primary>{t('components/Card/Update/read')}</Button>
      </Link>{' '}
      <Link
        href={{ pathname: `/einrichten`, query: { context: 'card' } }}
        passHref
        legacyBehavior>
        <Button>{t('components/Card/Update/onboarding')}</Button>
      </Link>
    </P>

    <div {...formStyles.portraitAndDetails}>
      <div {...formStyles.portrait}>
        <Portrait
          user={me}
          values={portrait.values}
          errors={portrait.errors}
          onChange={handlePortrait}
        />
      </div>
      <div {...formStyles.details}>
        <Details card={card} user={me} />
      </div>
    </div>

    <div {...formStyles.section}>
      {statementId && group ? (
        <P>
          <Link
            href={{
              pathname: '/wahltindaer/[group]/[suffix]',
              query: {
                group: group.slug,
                suffix: 'diskussion',
                focus: statementId,
              },
            }}
            passHref
            legacyBehavior>
            <A>Ihr Statement im «Wahltindär: {group.name}».</A>
          </Link>
        </P>
      ) : (
        <>
          <P>{t('components/Card/Claim/statement/question')}</P>
          <Statement
            label={t('components/Card/Claim/statement/label')}
            statement={statement}
            handleStatement={handleStatement}
          />
        </>
      )}
    </div>

    {false && (
      <div {...formStyles.section}>
        <CampaignBudget
          budget={budget}
          handleBudget={handleBudget}
          budgetComment={budgetComment}
          handleBudgetComment={handleBudgetComment}
        />
      </div>
    )}

    {false && (
      <div {...formStyles.section}>
        <VestedInterests
          vestedInterests={vestedInterests}
          handleVestedInterests={handleVestedInterests}
        />
      </div>
    )}

    {financingExpanded ? (
      <Financing collapsed financing={financing} onChange={handleFinancing} />
    ) : (
      <P style={{ marginTop: 40, marginBottom: 40 }}>
        <A
          href='#'
          onClick={(e) => {
            e.preventDefault()
            setFinancingExpanded(true)
          }}
        >
          {t.first([
            `components/Card/Form/Financing/headline/${locale}`,
            'components/Card/Form/Financing/headline',
          ])}
        </A>
      </P>
    )}

    {showErrors && errorMessages.length > 0 && (
      <div {...formStyles.errorMessages}>
        Fehler
        <br />
        <ul>
          {errorMessages.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      </div>
    )}

    <div {...formStyles.button}>
      {loading ? (
        <InlineSpinner />
      ) : (
        <Button
          primary={isDirty}
          type='submit'
          block
          onClick={updateCard}
          disabled={showErrors && errorMessages.length > 0}
        >
          {t('components/Card/Update/submit')}
        </Button>
      )}
    </div>

    {serverError && <ErrorMessage error={serverError} />}
  </>;
}

const fragmentCard = gql`
  fragment MyCard on Card {
    id
    payload
    group {
      id
      slug
      name
    }
    statement {
      id
    }
  }
`

const ME_CARD = gql`
  query updateCardForm {
    me {
      id
      name
      isUserOfCurrentSession
      portrait(properties: { width: 600, height: 800, bw: false })
      cards(first: 1) {
        nodes {
          ...MyCard
        }
      }
    }
  }

  ${fragmentCard}
`

const withMeCard = graphql(ME_CARD)

const UPDATE_CARD = gql`
  mutation updateCard(
    $id: ID!
    $portrait: String
    $statement: String!
    $payload: JSON
  ) {
    updateCard(
      id: $id
      portrait: $portrait
      statement: $statement
      payload: $payload
    ) {
      ...MyCard
    }
  }

  ${fragmentCard}
`

const withUpdateCard = graphql(UPDATE_CARD, {
  props: ({ mutate }) => ({
    updateCard: ({ id, portrait, statement, payload }) =>
      mutate({
        variables: { id, portrait, statement, payload },
      }),
  }),
})

export default compose(withRouter, withT, withMeCard, withUpdateCard)(Update)
