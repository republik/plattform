'use client'

import { Share } from '@app/components/share/share'
import { IconShare } from '@republik/icons'
import { css } from '@republik/theme/css'
import { hstack } from '@republik/theme/patterns'
import { ReactNode } from 'react'

const shareButtonStyle = hstack({
  gap: '2',
  // color: 'text',
  textStyle: 'sansSerifBold',
  fontSize: 'm',
  width: 'full',
  justifyContent: 'center',

  background: 'primary',
  color: 'text.primary',
  px: '4',
  py: '3',
  borderRadius: '4px',
  border: '2px solid token(colors.primary)',

  cursor: 'pointer',
  _hover: {
    background: 'pageBackground',
    color: 'primary',
  },
})

const ShareSection = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className={css({
        display: 'grid',
        gap: '8',
        gridTemplateColumns: `repeat(auto-fit, minmax(300px, 1fr))`,
      })}
    >
      {children}
    </div>
  )
}

export const ShareLink = ({ url }: { url: string }) => {
  return (
    <ShareSection>
      <div
        className={css({
          background: 'overlay',
          borderRadius: '4px',
          py: '3',
          px: '4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: 'medium',
          fontSize: 'xl',
          border: '2px solid token(colors.divider)',
          // maxWidth: 300,
        })}
      >
        {url}
      </div>
      <Share url={url} title='Link teilen' emailSubject=''>
        <div className={shareButtonStyle}>
          <IconShare size={20} />
          Link teilen
        </div>
      </Share>
    </ShareSection>
  )
}
