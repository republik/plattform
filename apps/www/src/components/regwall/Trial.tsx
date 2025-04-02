import { useState } from 'react'

import Image from 'next/image'

import { css } from '@republik/theme/css'

import { CDN_FRONTEND_BASE_URL } from 'lib/constants'

import TrialForm from '../auth/trial'
import { Button } from '../ui/button'

import Login from './Login'

// TODO: make css for container and css for b tag reusable

const TrialHeader = () => (
  <div
    className={css({
      display: 'flex',
      flexDir: 'column',
      gap: '4',
      pb: '4',
    })}
  >
    <Login />
    <div
      className={css({ display: 'flex', justifyContent: 'center', py: '4' })}
    >
      <Image
        src={`${CDN_FRONTEND_BASE_URL}/static/regwall/cover.svg`}
        alt='Illustration registration wall'
        width={240}
        height={240}
      />
    </div>
    <h2 className={css({ textStyle: 'h2Sans' })}>Sie müssen nichts bezahlen</h2>
    <div className={css({ textStyle: 'airy' })}>
      <p>
        <b className={css({ fontWeight: 500 })}>Werden Sie unser Gast:</b> Eine
        Woche lang gratis die Republik lesen, keine automatische Verlängerung.
      </p>
    </div>
  </div>
)

const WhyRegister = () => {
  // TODO: animate (ask @Jeremy)
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      className={css({
        mt: '4',
        backgroundColor: 'rgba(0,0,0,0.07)',
        borderRadius: '3x',
        p: '4',
      })}
    >
      {expanded ? (
        <div>
          <p>
            <b className={css({ fontWeight: 500 })}>
              Warum eine E-Mail-Adresse?
            </b>
            <br />
            Damit wir Ihnen zeigen können, wie wir arbeiten und warum es sich
            lohnt, unseren Journalismus zu unterstützen. Wenn Sie keine
            Nachrichten mehr erhalten möchten, können Sie sich jederzeit
            abmelden.
          </p>
        </div>
      ) : (
        <Button variant='link' type='button' onClick={() => setExpanded(true)}>
          Warum eine E-Mail-Adresse?
        </Button>
      )}
    </div>
  )
}

const Trial = () => {
  return (
    <div className={css({ backgroundColor: '#F2ECE6' })}>
      <div
        className={css({
          margin: '0 auto',
          maxW: 'center',
          padding: '4-8',
          display: 'flex',
          flexDir: 'column',
          gap: '4',
        })}
      >
        <TrialForm
          renderBefore={<TrialHeader />}
          renderAfter={<WhyRegister />}
        />
      </div>
    </div>
  )
}

export default Trial
