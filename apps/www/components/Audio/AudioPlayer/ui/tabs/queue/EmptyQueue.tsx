import React from 'react'
import { css } from 'glamor'
import { PlaylistAddIcon, fontStyles } from '@project-r/styleguide'

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
  return (
    <>
      <p {...styles.text}>{t('AudioPlayer/Queue/EmptyQueue/p1')}</p>
      <div {...styles.iconWrapper}>
        <PlaylistAddIcon size={36} />
      </div>
      <p {...styles.text}>{t('AudioPlayer/Queue/EmptyQueue/p2')}</p>
      <p {...styles.text}>{t('AudioPlayer/Queue/EmptyQueue/p3')}</p>
    </>
  )
}

export default EmptyQueue
