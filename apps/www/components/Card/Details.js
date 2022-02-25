import React from 'react'
import { css } from 'glamor'

import { mediaQueries, Editorial } from '@project-r/styleguide'

import withT from '../../lib/withT'
import { PUBLIC_BASE_URL } from '../../lib/constants'

import ShareButtons from '../ActionBar/ShareButtons'

import getPartyColor from './partyColors'
import { Paragraph, Finance } from './Shared'
import Spider from './Spider'

const SPIDER_SIZE = 260

const styles = {
  spider: css({
    [mediaQueries.mUp]: {
      float: 'right',
      width: SPIDER_SIZE,
      marginLeft: 10,
      marginBottom: 10,
    },
  }),
}

const Details = ({ card, t, mySmartspider, skipSpider, postElection }) => {
  const { payload, user, group } = card

  const { electionPlausibility } = payload.nationalCouncil
  const plausibilityText = t(
    `components/Card/electionPlausibility/${electionPlausibility}`,
    undefined,
    '',
  )
  const plausibilityEmoji = t(
    `components/Card/electionPlausibility/${electionPlausibility}/emoji`,
    undefined,
    '',
  )

  const linkSmartvote =
    payload.councilOfStates.linkSmartvote ||
    payload.nationalCouncil.linkSmartvote
  const incumbent =
    payload.councilOfStates.incumbent || payload.nationalCouncil.incumbent

  const partyColor = getPartyColor(payload.party)

  return (
    <>
      {payload.smartvoteCleavage && !skipSpider && (
        <div {...styles.spider}>
          <Spider
            size={SPIDER_SIZE}
            fill={partyColor}
            data={payload.smartvoteCleavage}
            reference={mySmartspider}
          />
        </div>
      )}
      {!postElection && !!payload.nationalCouncil.listName && (
        <Paragraph>
          Liste: {payload.nationalCouncil.listName}
          <br />
          {payload.nationalCouncil.listPlaces && (
            <>
              Listenplatz: {payload.nationalCouncil.listPlaces.join(' & ')}
              <br />
            </>
          )}
          {!!plausibilityText && (
            <>
              {t('components/Card/electionPlausibility/title', {
                text: plausibilityText,
                emoji: plausibilityEmoji,
              })}
            </>
          )}
        </Paragraph>
      )}
      <Paragraph>
        {postElection && (
          <>
            Partei: {payload.party}
            <br />
            Kanton: {group.name}
            <br />
          </>
        )}
        Beruf: {payload.occupation}
      </Paragraph>
      <Paragraph style={{ marginTop: 10 }}>
        <strong>{t('components/Card/Details/links')}</strong>
      </Paragraph>
      {!!linkSmartvote && (
        <Paragraph style={{ marginBottom: 10 }}>
          <Editorial.A href={linkSmartvote}>
            {t('components/Card/Details/smartvote')}
          </Editorial.A>
          <br />
          <small>{t('components/Card/Details/smartvote/note')}</small>
        </Paragraph>
      )}
      {!!payload.lobbywatch?.link && (
        <Paragraph style={{ marginBottom: 10 }}>
          <Editorial.A
            href={
              (payload.lobbywatch && payload.lobbywatch.link) ||
              'https://lobbywatch.ch/de/daten/parlamentarier'
            }
          >
            {t('components/Card/Details/lobbywatch')}
          </Editorial.A>
          <br />
          <small>{t('components/Card/Details/lobbywatch/note')}</small>
        </Paragraph>
      )}
      {!postElection && <Finance payload={payload} />}
      <Paragraph style={{ marginTop: 20 }}>
        <strong>{t('profile/share/overlayTitle')}</strong>
      </Paragraph>
      <ShareButtons
        url={`${PUBLIC_BASE_URL}/~${user.slug}`}
        tweet=''
        emailSubject={`🔥 ${user.name}`}
        emailBody=''
        emailAttachUrl
        eventCategory='CardShareButtons'
      />
    </>
  )
}

export default withT(Details)
