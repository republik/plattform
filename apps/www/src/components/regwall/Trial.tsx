import Image from 'next/image'

import { css } from '@republik/theme/css'

import { CDN_FRONTEND_BASE_URL } from 'lib/constants'

import TrialForm from '../auth/trial'

import Login from './Login'

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
        <Login />
        <div className={css({ py: '4' })}>
          <Image
            src={`${CDN_FRONTEND_BASE_URL}/static/regwall/cover.svg`}
            alt='Illustration registration wall'
            width={240}
            height={240}
          />
        </div>
        <h2 className={css({ textStyle: 'h2Sans' })}>
          Sie müssen nichts bezahlen
        </h2>
        <div className={css({ textStyle: 'airy' })}>
          <p>
            <b className={css({ fontWeight: 500 })}>Werden Sie unser Gast:</b>{' '}
            Eine Woche lang gratis die Republik lesen, keine automatische
            Verlängerung.
          </p>
        </div>
        <TrialForm />
      </div>
    </div>
  )
}

export default Trial
