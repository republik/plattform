import React from 'react'
import Link from 'next/link'
import { css } from 'glamor'
import { fontStyles, A, useColorContext } from '@project-r/styleguide'
import { useMe } from '../../../../../../lib/context/MeContext'
import { IconPlaylistAdd } from '@republik/icons'

const styles = {
  text: css({
    ...fontStyles.sansSerifRegular16,
    lineHeight: '22px',
    marginTop: 24,
  }),
}

const EmptyQueue = ({ t }: { t: any }) => {
  const { progressConsent } = useMe()
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('color', 'text')}>
      <p {...styles.text}>{t('AudioPlayer/Queue/EmptyQueue/p1')}</p>
      <p {...styles.text}>
        {t.elements('AudioPlayer/Queue/EmptyQueue/p2', {
          icon: <IconPlaylistAdd key='add-icon' size={24} />,
        })}
      </p>
      {!progressConsent && (
        <p {...styles.text}>
          {t('AudioPlayer/Queue/EmptyQueue/progressInfo')}{' '}
          <Link href='/konto/einstellungen' legacyBehavior>
            <A style={{ cursor: 'pointer' }}>
              {t('AudioPlayer/Queue/EmptyQueue/progressLink')}
            </A>
          </Link>
          .
        </p>
      )}
    </div>
  )
}

export default EmptyQueue
