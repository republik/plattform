import { useState } from 'react'
import { csvFormat } from 'd3-dsv'
import { gql } from '@apollo/client'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'

import { Editorial, Loader } from '@project-r/styleguide'

import { Table, TitleRow, CardRows } from './Table'

import { swissTime } from '../../lib/utils/format'

import { Paragraph } from './Shared'
import TrialForm from './TrialForm'

const query = gql`
  query getMyListCards($cardIds: [ID!]!, $first: Int!) {
    cards(focus: $cardIds, first: $first) {
      nodes {
        id
        user {
          id
          name
          slug
        }
        payload(
          paths: [
            "party"
            "yearOfBirth"
            "nationalCouncil.candidacy"
            "nationalCouncil.votes"
            "nationalCouncil.elected"
            "nationalCouncil.listNumbers"
            "councilOfStates.candidacy"
            "councilOfStates.votes"
            "councilOfStates.elected"
            "councilOfStates.secondBallotNecessary"
          ]
        )
      }
    }
  }
`

const formatDate = swissTime.format('%Y-%m-%d-%H%M')

const MyList = ({
  onClose,
  swipes,
  onReset,
  revertCard,
  followCard,
  ignoreCard,
  queue,
  isPersisted,
  isStale,
  t,
  me,
  data,
}) => {
  const [showIgnore, setShowIgnore] = useState(false)

  if (data.loading || data.error) {
    return <Loader loading={data.loading} error={data.error} />
  }

  const { statePerUserId, pending } = queue
  const withCards = swipes
    .filter((swipe) => swipe.cardCache)
    .map((swipe) => ({
      ...swipe,
      card:
        data.cards.nodes.find((n) => n.id === swipe.cardId) || swipe.cardCache,
    }))
  const rightSwipes = withCards
    .filter((swipe) => swipe.dir === 1)
    .map((swipe) => {
      const pendingItem = pending.find(
        (item) => item.userId === swipe.card.user.id,
      )
      return {
        card: swipe.card,
        sub:
          statePerUserId[swipe.card.user.id] ||
          (pendingItem && pendingItem.sub),
        pending: me && !!pendingItem,
      }
    })
  const activeRightSwipes = rightSwipes.filter((swipe) => swipe.sub)
  const leftoverRightSwipes = rightSwipes.filter((swipe) => !swipe.sub)
  const leftSwipes = leftoverRightSwipes.concat(
    withCards
      .filter((swipe) => swipe.dir === -1)
      .map((swipe) => ({
        card: swipe.card,
      })),
  )

  const ignoreTitle = t.pluralize('components/Card/MyList/ignoreTitle', {
    count: leftSwipes.length,
  })

  return <>
    {!withCards.length ? (
      <Paragraph>
        <strong>{t('components/Card/MyList/nothing')}</strong>
      </Paragraph>
    ) : (
      <Table>
        {!!activeRightSwipes.length && (
          <>
            <TitleRow>
              {t.pluralize('components/Card/MyList/followTitle', {
                count: activeRightSwipes.length,
              })}
            </TitleRow>
            <CardRows
              t={t}
              revertCard={revertCard}
              ignoreCard={ignoreCard}
              nodes={activeRightSwipes}
            />
          </>
        )}
        {!!leftSwipes.length && (
          <>
            <TitleRow
              onClick={() => {
                setShowIgnore(!showIgnore)
              }}
            >
              <Editorial.A
                href='#'
                onClick={(e) => {
                  e.preventDefault()
                  setShowIgnore(!showIgnore)
                }}
              >
                {showIgnore ? ignoreTitle : ignoreTitle.replace(/:$/, '')}
              </Editorial.A>
            </TitleRow>
            {showIgnore && (
              <CardRows
                t={t}
                revertCard={revertCard}
                followCard={followCard}
                nodes={leftSwipes}
              />
            )}
          </>
        )}
      </Table>
    )}
    <br />
    {(!me || isStale) && (
      <>
        <Paragraph>{t('components/Card/MyList/trial')}</Paragraph>
        <TrialForm />
        <br />
      </>
    )}
    <Paragraph>
      <strong>{t('components/Card/MyList/data/title')}</strong>
    </Paragraph>
    <Paragraph>
      {t(
        `components/Card/MyList/data/${
          isPersisted ? 'isPersisted' : 'notPersisted'
        }`,
      )}
    </Paragraph>
    <br />
    <Paragraph>
      <Editorial.A
        download={`wahltindaer-${formatDate(new Date())}.csv`}
        onClick={(e) => {
          const url = (e.target.href = URL.createObjectURL(
            new window.Blob(
              [
                csvFormat(
                  withCards.map((s) => ({
                    status: s.dir === 1 ? 'folgen' : 'ignorieren',
                    name: s.card.user.name,
                    partei: s.card.payload.party,
                    jahrgang: s.card.payload.yearOfBirth,
                    reoublikLink: `https://www.republik.ch/~${s.card.user.slug}`,
                    smartvoteLink:
                      s.cardCache.payload.councilOfStates.linkSmartvote ||
                      s.cardCache.payload.nationalCouncil.linkSmartvote,
                  })),
                ),
              ],
              { type: 'text/csv' },
            ),
          ))
          setTimeout(function () {
            URL.revokeObjectURL(url)
          }, 50)
        }}
      >
        {t('components/Card/MyList/data/download')}
      </Editorial.A>
      <br />
      {isPersisted && (
        <Editorial.A
          href='#'
          onClick={(e) => {
            e.preventDefault()
            if (
              !window.confirm(t('components/Card/MyList/data/clear/confirm'))
            ) {
              return
            }
            onReset()
            onClose()
          }}
        >
          {t('components/Card/MyList/data/clear')}
        </Editorial.A>
      )}
    </Paragraph>
  </>;
}

export default compose(graphql(query))(MyList)
