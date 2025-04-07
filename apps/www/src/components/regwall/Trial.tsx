import { useState } from 'react'

import Image from 'next/image'

import { css } from '@republik/theme/css'

import { CDN_FRONTEND_BASE_URL } from 'lib/constants'

import TrialForm from '../auth/trial'
import { Button } from '../ui/button'

import Login from './Login'
import { useTranslation } from 'lib/withT'

// TODO: make css for container and css for b tag reusable

const TrialHeader = () => {
  const { t } = useTranslation()
  return (
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
      <h2 className={css({ textStyle: 'h2Sans' })}>
        {t('regwall/header/title')}
      </h2>
      <div className={css({ textStyle: 'airy' })}>
        <p
          dangerouslySetInnerHTML={{ __html: t('regwall/header/description') }}
        />
      </div>
    </div>
  )
}

const WhyRegister = () => {
  // TODO: animate?
  const { t } = useTranslation()
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
              {t('regwall/whyRegister/title')}
            </b>
            <br />
            {t('regwall/whyRegister/description')}
          </p>
        </div>
      ) : (
        <Button variant='link' type='button' onClick={() => setExpanded(true)}>
          {t('regwall/whyRegister/title')}
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
          maxW: 'narrow',
          padding: '4-6',
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
