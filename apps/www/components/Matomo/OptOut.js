import { useCallback, useEffect, useState, useRef } from 'react';

import { Label, A } from '@project-r/styleguide'

import withT from '../../lib/withT'
import track from '../../lib/matomo'

import Anchor from '../Anchor'

const OptOut = ({ t }) => {
  const [status, setStatus] = useState('loading')
  const timeout = useRef()
  const loadStatus = useCallback(() => {
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      setStatus('timeout')
    }, 15000)
    track([
      function () {
        clearTimeout(timeout.current)
        setStatus(this.isUserOptedOut() ? 'off' : 'on')
      },
    ])
  }, [])
  useEffect(() => {
    if (navigator.doNotTrack) {
      setStatus('dnt')
      return
    }
    loadStatus()
    return () => {
      clearTimeout(timeout.current)
    }
  }, [])

  return (
    <span>
      <Anchor id='tracking' />
      <Label>{t('matomo/optOut/label')}</Label>
      <br />
      {!!status && t(`matomo/optOut/status/${status}`)}
      {(status === 'off' || status === 'on') && (
        <A
          href='#tracking'
          onClick={(e) => {
            e.preventDefault()
            setStatus('saving')
            if (status === 'off') {
              // needs double call for loadStatus to switch in Safari
              track(['forgetUserOptOut'])
              track(['forgetUserOptOut'])
            } else {
              track(['optUserOut'])
            }
            loadStatus()
          }}
        >
          {' '}
          {t(`matomo/optOut/turn/${status === 'off' ? 'on' : 'off'}`)}
        </A>
      )}
      <noscript>{t('matomo/optOut/noscript')}</noscript>
    </span>
  )
}

export default withT(OptOut)
