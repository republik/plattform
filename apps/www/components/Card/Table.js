import { Fragment } from 'react'
import { css, merge } from 'glamor'
import { nest } from 'd3-collection'
import { ascending, descending } from 'd3-array'

import IgnoreIcon from './IgnoreIcon'

import {
  fontStyles,
  Editorial,
  plainButtonRule,
  InlineSpinner,
  colors,
} from '@project-r/styleguide'

import { countFormat } from '../../lib/utils/format'

import { cardColors } from './constants'
import Link from 'next/link'
import { IconCheck, IconFollow, IconRevert } from '@republik/icons'

const PADDING = 10

const mdCheckProps = {
  style: { marginTop: -4, marginRight: 5 },
  fill: 'var(--color-primary)',
}

const td = css({
  textAlign: 'left',
  verticalAlign: 'top',
  paddingTop: 5,
  paddingBottom: 5,
  paddingLeft: PADDING,
  paddingRight: PADDING,
})

const num = merge(td, {
  textAlign: 'right',
  fontFeatureSettings: '"tnum" 1, "kern" 1',
})

const styles = {
  table: css({
    ...fontStyles.sansSerifRegular,
    borderSpacing: '0',
    paddingLeft: 0,
    paddingRight: 0,
    minWidth: '100%',
    '@media (max-width: 600px)': {
      fontSize: 14,
    },
    '& th': {
      ...fontStyles.sansSerifMedium,
    },
  }),
  td,
  num,
  titleTd: css(td, {
    paddingTop: 10,
    'tr:first-child > &': {
      paddingTop: 5,
    },
  }),
  highlight: css({
    ...fontStyles.sansSerifMedium,
  }),
  actionButton: css(plainButtonRule, {
    lineHeight: 0,
    borderRadius: '50%',
    padding: 4,
    '& + &': {
      marginLeft: 3,
    },
  }),
}

export const Table = ({ children }) => (
  <div
    style={{
      overflowX: 'auto',
      overflowY: 'hidden',
      marginLeft: -PADDING,
      marginRight: -PADDING,
    }}
  >
    <table {...styles.table}>
      <tbody>{children}</tbody>
    </table>
  </div>
)

export const TitleRow = ({ children }) => (
  <tr>
    <th colSpan='3' {...styles.titleTd}>
      {children}
    </th>
  </tr>
)

const keySort = ['Gewählt sind:', 'Noch offen:', 'Nicht gewählt sind:']

export const CardRows = ({ nodes, revertCard, ignoreCard, followCard, t }) => (
  <>
    {nest()
      .key(({ card: { payload } }) =>
        payload.nationalCouncil.elected || payload.councilOfStates.elected
          ? 'Gewählt sind:'
          : payload.councilOfStates.candidacy &&
            payload.councilOfStates.secondBallotNecessary
          ? 'Noch offen:'
          : 'Nicht gewählt sind:',
      )
      .sortKeys((a, b) => ascending(keySort.indexOf(a), keySort.indexOf(b)))
      .sortValues(
        (a, b) =>
          descending(
            Math.max(
              a.card.payload.nationalCouncil.votes || 0,
              a.card.payload.councilOfStates.votes || 0,
            ),
            Math.max(
              b.card.payload.nationalCouncil.votes || 0,
              b.card.payload.councilOfStates.votes || 0,
            ),
          ) ||
          ascending(
            a.card.payload.nationalCouncil.listNumbers[0],
            b.card.payload.nationalCouncil.listNumbers[0],
          ),
      )
      .entries(nodes)
      .map(({ key, values: cards }) => (
        <Fragment key={key}>
          <tr>
            <th
              {...styles.td}
              style={{
                paddingTop: 10,
                paddingBottom: 5,
              }}
            >
              {key}
            </th>
            <th
              {...styles.num}
              style={{
                paddingTop: 10,
                paddingBottom: 5,
              }}
            >
              Stimmen
            </th>
            <th />
          </tr>
          {cards.map(({ card, pending }, i) => {
            const dualCandidacy =
              !!card.payload.councilOfStates.candidacy &&
              !!card.payload.nationalCouncil.candidacy
            return (
              <tr
                key={`entity${i}`}
                style={{
                  background: i % 2 ? 'var(--color-hover)' : undefined,
                }}
              >
                <td {...styles.td}>
                  <Link href={`/~${card.user.slug}`} passHref>
                    <Editorial.A>
                      {card.user.name}
                      {card.payload.party && `, ${card.payload.party}`}
                    </Editorial.A>
                  </Link>
                </td>
                <td {...styles.num}>
                  {card.payload.councilOfStates.candidacy &&
                    card.payload.councilOfStates.votes !== null && (
                      <>
                        {'SR: '}
                        {card.payload.councilOfStates.elected && (
                          <IconCheck {...mdCheckProps} />
                        )}
                        {!!card.payload.councilOfStates.votes &&
                          countFormat(card.payload.councilOfStates.votes)}
                        {card.payload.councilOfStates.secondBallotNecessary &&
                          !card.payload.councilOfStates.elected && (
                            <>
                              <br />
                              noch offen
                            </>
                          )}
                      </>
                    )}
                  {dualCandidacy && <br />}
                  {card.payload.nationalCouncil.candidacy &&
                    card.payload.nationalCouncil.votes !== null && (
                      <>
                        {dualCandidacy ? 'NR: ' : ''}
                        {card.payload.nationalCouncil.elected && (
                          <IconCheck {...mdCheckProps} />
                        )}
                        {!!card.payload.nationalCouncil.votes &&
                          countFormat(card.payload.nationalCouncil.votes)}
                      </>
                    )}
                </td>
                <td
                  {...styles.td}
                  style={{
                    whiteSpace: 'nowrap',
                    width: 85,
                    paddingTop: 3,
                    paddingBottom: 3,
                  }}
                >
                  {pending ? (
                    <InlineSpinner size={18} />
                  ) : (
                    <>
                      <button
                        {...styles.actionButton}
                        title={t('components/Card/Group/revert')}
                        onClick={(e) => {
                          e.preventDefault()
                          revertCard(card)
                        }}
                        style={{
                          backgroundColor: cardColors.revert,
                        }}
                      >
                        <IconRevert fill='#fff' size={14} />
                      </button>
                      <button
                        {...styles.actionButton}
                        title={t('components/Card/Group/ignore')}
                        onClick={(e) => {
                          e.preventDefault()
                          ignoreCard && ignoreCard(card)
                        }}
                        style={{
                          backgroundColor: ignoreCard
                            ? cardColors.left
                            : 'var(--color-disabled)',
                          cursor: ignoreCard ? 'pointer' : 'default',
                        }}
                      >
                        <IgnoreIcon fill='#fff' size={14} />
                      </button>
                      <button
                        {...styles.actionButton}
                        title={t('components/Card/Group/follow')}
                        onClick={(e) => {
                          e.preventDefault()
                          followCard && followCard(card)
                        }}
                        style={{
                          backgroundColor: followCard
                            ? cardColors.right
                            : 'var(--color-disabled)',
                          cursor: followCard ? 'pointer' : 'default',
                        }}
                      >
                        <IconFollow fill='#fff' size={14} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )
          })}
        </Fragment>
      ))}
  </>
)
