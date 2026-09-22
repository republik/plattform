import { useMe } from '@/lib/context/MeContext'
import { A, fontStyles } from '@project-r/styleguide'
import { IconPlaylistAdd } from '@republik/icons'
import { token } from '@republik/theme/tokens'
import { css } from 'glamor'
import Link from 'next/link'

const styles = {
  wrapper: css({
    color: token.var('colors.text'),
  }),
  text: css({
    ...fontStyles.sansSerifRegular16,
    lineHeight: '22px',
    marginTop: 24,
  }),
}

const EmptyQueue = ({ t }: { t: any }) => {
  const { progressConsent } = useMe()
  return (
    <div {...styles.wrapper}>
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
