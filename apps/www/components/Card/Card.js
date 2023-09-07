import { useState } from 'react'
import { css } from 'glamor'

import {
  Interaction,
  IconButton,
  shouldIgnoreClick,
} from '@project-r/styleguide'

import withInNativeApp, { postMessage } from '../../lib/withInNativeApp'
import { countFormat } from '../../lib/utils/format'

import Spider from './Spider'
import getPartyColor from './partyColors'
import InfoIcon from './InfoIcon'

import sharedStyles from '../sharedStyles'

import { SmallParagraph, Finance } from './Shared'

import { rgb } from 'd3-color'
import Link from 'next/link'
import { IconCheck, IconDiscussion } from '@republik/icons'

export const MEDIUM_MIN_WIDTH = 360

const PADDING = 15

const mdCheckProps = {
  style: { marginTop: -4, marginLeft: 5 },
  fill: 'var(--color-primary)',
}

export const styles = {
  card: css({
    position: 'absolute',
    width: '100vw',
    top: 20,
    bottom: 80,
    minHeight: 340,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  cardInner: css({
    position: 'relative',
    userSelect: 'none',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow:
      '0 12px 50px -10px rgba(0, 0, 0, 0.4), 0 10px 10px -10px rgba(0, 0, 0, 0.1)',
  }),
  bottomText: css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: `5px ${PADDING}px`,
    backgroundColor: '#fff',
    fontSize: 14,
    lineHeight: '16px',
    [`@media (min-width: ${MEDIUM_MIN_WIDTH}px)`]: {
      padding: `10px ${PADDING}px`,
      fontSize: 16,
      lineHeight: '20px',
    },
  }),
  bottomTextVotes: css({
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: PADDING,
    paddingRight: PADDING,
    marginLeft: -PADDING,
    marginRight: -PADDING,
    marginBottom: -5,
    marginTop: 5,
    [`@media (min-width: ${MEDIUM_MIN_WIDTH}px)`]: {
      marginBottom: -10,
    },
    fontFeatureSettings: '"tnum" 1, "kern" 1',
  }),
  icons: css({
    zIndex: 1,
    position: 'absolute',
    top: -16,
    right: PADDING,
  }),
  portrait: css({
    height: '100%',
    backgroundSize: 'cover',
  }),
  occupation: css({
    display: 'block',
    maxHeight: 40,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  }),
  centerContent: css({
    width: 280,
    margin: '0 auto',
    paddingTop: PADDING - 2,
    [`@media (min-width: ${MEDIUM_MIN_WIDTH}px)`]: {
      paddingTop: PADDING + 3,
    },
  }),
  opacityHover: css({
    '@media(hover)': {
      '[href]:hover > *': {
        opacity: 0.8,
      },
    },
  }),
}

const getTextColor = (bgColor) => {
  const color = rgb(bgColor)
  const yiq = (color.r * 299 + color.g * 587 + color.b * 114) / 1000
  return yiq >= 128 ? 'black' : 'white'
}

const Card = ({
  payload,
  user,
  statement,
  group,
  contextGroup,
  dragTime,
  width,
  inNativeIOSApp,
  onDetail,
  t,
  mySmartspider,
  medianSmartspiderQuery,
  firstSlideOnly,
  onSlide,
  noEmoji,
}) => {
  const [slide, setSlide] = useState(0)

  const gotoSlide = (nextSlide) => {
    if (nextSlide !== slide) {
      setSlide(nextSlide)
      if (onSlide) {
        onSlide(nextSlide)
      }
    }
    if (inNativeIOSApp) {
      postMessage({
        type: 'haptic',
        payload: {
          type: nextSlide !== slide ? 'impactLight' : 'impactHeavy',
        },
      })
    }
  }

  const { councilOfStates, nationalCouncil } = payload
  const innerWidth = width - PADDING * 2
  const textLines = 2 + !!payload.occupation + !!councilOfStates.candidacy

  const partyColor = getPartyColor(payload.party)
  const slides = [
    user.portrait && (
      <div
        key='portrait'
        {...styles.portrait}
        style={{
          backgroundImage: `url(${user.portrait})`,
          height: `calc(100% - ${16 * textLines + 10}px)`,
        }}
      />
    ),
    payload.smartvoteCleavage && (
      <div key='spider' {...styles.centerContent} style={{ width: innerWidth }}>
        <SmallParagraph>
          <strong>{t('components/Card/Smartspider/title')}</strong>
          <br />
          <small>{t('components/Card/Smartspider/legend')}</small>
        </SmallParagraph>
        <Spider
          size={innerWidth}
          fill={partyColor}
          data={payload.smartvoteCleavage}
          reference={mySmartspider}
        />
      </div>
    ),
    <div key='finance' {...styles.centerContent} style={{ width: innerWidth }}>
      <Finance payload={payload} width={innerWidth} />
    </div>,
  ]
    .filter(Boolean)
    .slice(0, firstSlideOnly ? 1 : undefined)
  const totalSlides = slides.length

  const { listPlaces, electionPlausibility } = nationalCouncil
  const plausibilityEmoji =
    !noEmoji &&
    t(
      `components/Card/electionPlausibility/${electionPlausibility}/emoji`,
      undefined,
      '',
    )
  const dualCandidacy =
    !!nationalCouncil.candidacy && !!councilOfStates.candidacy
  const hasVotes = !!(nationalCouncil.votes || councilOfStates.votes)

  const differentContext = !!(
    contextGroup &&
    group &&
    contextGroup.slug !== group.slug
  )

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: '#f3f3f3',
        color: 'var(--color-text)',
        borderBottom: hasVotes ? undefined : `10px solid ${partyColor}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {slides[slide]}
      {totalSlides > 1 && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 10,
            right: 10,
          }}
        >
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${(i * 100) / totalSlides + 1}%`,
                width: `${100 / totalSlides - 2}%`,
                height: 3,
                borderRadius: 1,
                backgroundColor: i === slide ? '#fff' : 'rgba(0, 0, 0, 0.2)',
              }}
            />
          ))}
        </div>
      )}
      <div {...styles.bottomText} {...Interaction.fontRule}>
        <div {...styles.icons}>
          {!!statement && (
            <>
              <Link
                href={{
                  pathname: '/wahltindaer/[group]/[suffix]',
                  query: {
                    group: differentContext ? contextGroup.slug : group.slug,
                    suffix: 'diskussion',
                    focus: statement.id,
                    ...medianSmartspiderQuery,
                    ...(differentContext && {
                      discussion: group.discussion.id,
                    }),
                  },
                }}
                passHref
              >
                <IconButton
                  Icon={IconDiscussion}
                  label={1 + statement.comments.totalCount}
                  fill={'var(--color-primary)'}
                />
              </Link>
            </>
          )}
          {!!onDetail && (
            <a
              href={`/~${user.slug}`}
              onClick={(e) => {
                if (shouldIgnoreClick(e)) {
                  return
                }
                e.preventDefault()
                onDetail()
              }}
              {...sharedStyles.plainButton}
              {...styles.opacityHover}
            >
              <InfoIcon size={30} fill='#000' />
            </a>
          )}
        </div>
        <strong>
          {councilOfStates.candidacy && (
            <>
              {t(
                `components/Card/candidacy/${
                  nationalCouncil.candidacy ? 'sr_nr' : 'sr'
                }`,
              )}
              <br />
            </>
          )}
          {user.name}
        </strong>
        {!!(payload.age || payload.yearOfBirth) && (
          <>
            {','}&nbsp;
            {payload.age || payload.yearOfBirth}
          </>
        )}
        <br />
        <strong>
          {!contextGroup || contextGroup.slug !== group.slug
            ? `${group.name}, `
            : undefined}
          {payload.party}
          {','}&nbsp;
          {councilOfStates.candidacy
            ? councilOfStates.elected
              ? nationalCouncil.candidacy
                ? t(
                    `components/Card/${
                      councilOfStates.incumbent ? 're' : ''
                    }elected/sr`,
                  )
                : t.first(
                    [
                      `components/Card/${
                        councilOfStates.incumbent ? 're' : ''
                      }elected/${group.slug}`,
                      !councilOfStates.votes &&
                        `components/Card/${
                          councilOfStates.incumbent ? 're' : ''
                        }elected/silent`,
                      `components/Card/${
                        councilOfStates.incumbent ? 're' : ''
                      }elected`,
                    ].filter(Boolean),
                  )
              : nationalCouncil.elected
              ? t(
                  `components/Card/${
                    nationalCouncil.incumbent ? 're' : ''
                  }elected/nr`,
                )
              : councilOfStates.incumbent
              ? t('components/Card/incumbent')
              : nationalCouncil.incumbent
              ? t('components/Card/incumbent/nr')
              : t('components/Card/incumbent/new')
            : nationalCouncil.elected
            ? councilOfStates.candidacy
              ? t(
                  `components/Card/${
                    nationalCouncil.incumbent ? 're' : ''
                  }elected/nr`,
                )
              : t(
                  `components/Card/${
                    nationalCouncil.incumbent ? 're' : ''
                  }elected`,
                )
            : nationalCouncil.incumbent
            ? t('components/Card/incumbent')
            : t('components/Card/incumbent/new')}
        </strong>
        {listPlaces && !!listPlaces.length && (
          <>
            {`, ${t(
              'components/Card/listPlaces',
            ).trim()}${'\u00a0'}${listPlaces.join(' & ')}`}
            {!!plausibilityEmoji && `${'\u00a0'}${plausibilityEmoji}`}
          </>
        )}
        <br />
        <span {...styles.occupation}>{payload.occupation}</span>
        {hasVotes && (
          <div
            style={{
              backgroundColor: partyColor,
              color: getTextColor(partyColor),
            }}
            {...styles.bottomTextVotes}
          >
            {councilOfStates.candidacy && !!councilOfStates.votes && (
              <>
                {dualCandidacy && 'SR: '}
                {t.pluralize('components/Card/votes', {
                  count: councilOfStates.votes,
                  formattedCount: countFormat(councilOfStates.votes),
                })}
                {councilOfStates.elected && <IconCheck {...mdCheckProps} />}
                {!!councilOfStates.secondBallotNecessary &&
                  !councilOfStates.elected &&
                  ', noch offen'}
                {dualCandidacy && <br />}
              </>
            )}
            {!!nationalCouncil.votes && (
              <>
                {dualCandidacy && 'NR: '}
                {nationalCouncil.candidacy &&
                  t.pluralize('components/Card/votes', {
                    count: nationalCouncil.votes,
                    formattedCount: countFormat(nationalCouncil.votes),
                  })}
                {nationalCouncil.elected && <IconCheck {...mdCheckProps} />}
              </>
            )}
          </div>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          top: 0,
          left: 0,
          width: '50%',
        }}
        onClick={() => {
          if (dragTime && dragTime.current > 100) {
            return
          }
          gotoSlide(Math.max(0, slide - 1))
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          top: 0,
          right: 0,
          width: '50%',
        }}
        onClick={() => {
          if (dragTime && dragTime.current > 100) {
            return
          }
          gotoSlide(Math.min(totalSlides - 1, slide + 1))
        }}
      />
    </div>
  )
}

export default withInNativeApp(Card)
