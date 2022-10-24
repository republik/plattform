import React from 'react'
import Link from 'next/link'
import { css } from 'glamor'
import { PlaylistAddIcon, fontStyles, A } from '@project-r/styleguide'
import { useMe } from '../../../../../../lib/context/MeContext'

const styles = {
  text: css({
    ...fontStyles.sansSerifRegular16,
    lineHeight: '22px',
    '&:last-child': {
      marginBottom: 0,
    },
  }),
  iconWrapper: css({
    marginLeft: 24,
  }),
}

const EmptyQueue = ({ t }: { t: any }) => {
  const { me } = useMe()
  return (
    <>
      <p {...styles.text}>{t('AudioPlayer/Queue/EmptyQueue/p1')}</p>
      <p {...styles.text}>
        {t.elements('AudioPlayer/Queue/EmptyQueue/p2', {
          icon: <PlaylistAddIcon size={24} />,
        })}
      </p>
      {me && !me.progressConsent && (
        <p {...styles.text}>
          {t('AudioPlayer/Queue/EmptyQueue/progressInfo')}{' '}
          <Link href='/konto/einstellungen'>
            <A style={{ cursor: 'pointer' }}>
              {t('AudioPlayer/Queue/EmptyQueue/progressLink')}
            </A>
          </Link>
          .
        </p>
      )}
    </>
  )
}

export default EmptyQueue
