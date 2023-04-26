import React from 'react'
import Link from 'next/link'
import { css } from 'glamor'
import { PlaylistAddIcon, fontStyles, A } from '@project-r/styleguide'
import { useMe } from '../../../../../../lib/context/MeContext'
import { useColorContext } from '@project-r/styleguide/src/components/Colors/ColorContext'

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
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('color', 'text')}>
      <p {...styles.text}>{t('AudioPlayer/Queue/EmptyQueue/p1')}</p>
      <p {...styles.text}>
        {t.elements('AudioPlayer/Queue/EmptyQueue/p2', {
          icon: <PlaylistAddIcon size={24} />,
        })}
      </p>
      {me && !me.progressConsent && (
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
