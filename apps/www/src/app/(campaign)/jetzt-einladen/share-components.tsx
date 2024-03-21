'use client'

import { Share } from '@app/components/share/share'
import { ShareImage } from '@app/components/share/share-image'
import { useTrackEvent } from '@app/lib/matomo/event-tracking'
import { css } from '@app/styled-system/css'
import { hstack, vstack } from '@app/styled-system/patterns'
import { IconDownload, IconShare } from '@republik/icons'
import Image from 'next/image'
import Link from 'next/link'
import { ReactNode, useState } from 'react'

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

export const ShareImageConfigurator = ({
  url,
  userHasPublicProfile,
}: {
  url: string
  userHasPublicProfile: boolean
}) => {
  const [showPortrait, setShowPortrait] = useState(true)
  const trackEvent = useTrackEvent()

  const imageUrl =
    showPortrait && userHasPublicProfile
      ? `${url}/share-image-portrait`
      : `${url}/share-image`

  return (
    <ShareSection>
      <div
        className={css({
          background: 'overlay',
          borderRadius: '4px',
          p: '4',
          border: '2px solid token(colors.divider)',
          width: 'full',
        })}
      >
        <Image
          alt='Kampagnenbild'
          src={imageUrl}
          className={css({
            width: '100%',
            borderRadius: '2px',
          })}
          width={1080}
          height={1920}
          unoptimized
        />
      </div>
      <div
        className={vstack({
          gap: '4',
          alignItems: 'stretch',
        })}
      >
        <ShareImage imageSrc={imageUrl}>
          <div className={shareButtonStyle}>
            <IconShare size={20} /> Bild teilen
          </div>
        </ShareImage>
        <Link
          className={css({ textDecoration: 'none' })}
          href={imageUrl}
          download={'share-image.png'}
          onClick={() => {
            trackEvent({
              action: 'shareImageDownload',
              name: showPortrait
                ? 'withProfilePicture'
                : 'withoutProfilePicture',
            })
          }}
        >
          <div className={shareButtonStyle}>
            <IconDownload size={20} />
            Bild herunterladen
          </div>
        </Link>

        {userHasPublicProfile && (
          <label>
            <input
              type='checkbox'
              value='show_portrait'
              checked={showPortrait}
              onChange={(e) => setShowPortrait(e.currentTarget.checked)}
            ></input>
            &nbsp;Profilbild anzeigen
          </label>
        )}
      </div>
    </ShareSection>
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
