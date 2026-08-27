'use client'

import type { ArticlePortableTextBlockType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import type { Src } from '@/sanity.types'
import { usePlatformInformation } from '@/app/lib/hooks/usePlatformInformation'
import { useTranslation } from '@/lib/withT'
import { css, cva } from '@republik/theme/css'
import { CirclePlay, ExternalLink as ExternalLinkIcon } from 'lucide-react'
import { stegaClean } from 'next-sanity'
import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'

const containerStyle = cva({
  base: {},
  variants: {
    size: {
      NORMAL: {},
      BREAKOUT: {
        gridColumn: 'breakout',
      },
      FULL: {
        gridColumn: 'full',
      },
    },
  },
})

const videoStyle = css({
  width: 'full',
  objectFit: 'contain',
})

const thumbnailButtonStyle = css({
  position: 'relative',
  display: 'block',
  width: 'full',
  padding: 0,
  border: 'none',
  cursor: 'pointer',
})

const thumbnailImageStyle = css({
  display: 'block',
  width: 'full',
  height: 'auto',
  objectFit: 'cover',
})

const playIconStyle = css({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: 'white',
  filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.5))',
})

const consentNoteStyle = css({
  position: 'absolute',
  left: '5%',
  right: '5%',
  bottom: '8%',
  color: 'white',
  textAlign: 'center',
  fontSize: 's',
  lineHeight: 1.3,
  textShadow: '0 0 6px rgba(0, 0, 0, 0.8)',
})

const iframeContainerStyle = css({
  position: 'relative',
  width: 'full',
})

const iframeStyle = css({
  position: 'absolute',
  inset: 0,
  width: 'full',
  height: 'full',
  border: 0,
})

const linkStyle = css({
  textDecoration: 'underline',
  cursor: 'pointer',
})

function VideoThumbnail({
  poster,
  aspectRatio,
  label,
  note,
  icon,
  onClick,
  href,
}: {
  poster: string
  aspectRatio?: number
  label: string
  note?: ReactNode
  icon: ReactNode
} & (
  | { onClick: () => void; href?: undefined }
  | { href: string; onClick?: undefined }
)) {
  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=''
        className={thumbnailImageStyle}
        style={{ aspectRatio: aspectRatio ?? '16 / 9' }}
      />
      {icon}
      {note ? <span className={consentNoteStyle}>{note}</span> : null}
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target='_blank'
        rel='noopener'
        className={thumbnailButtonStyle}
        aria-label={label}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      type='button'
      className={thumbnailButtonStyle}
      onClick={onClick}
      aria-label={label}
    >
      {content}
    </button>
  )
}

function HlsVideo({
  src,
  poster,
  aspectRatio,
}: {
  src: Src
  poster?: string
  aspectRatio?: number
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src.hls) {
      return
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // canPlayType is only a heuristic — fall back to the mp4 <source> if
      // the native HLS playback actually fails (e.g. a stale/expired
      // signed manifest URL, or a browser that over-reports support).
      const handleError = () => {
        if (src.mp4) {
          video.removeAttribute('src')
          video.load()
        }
      }
      video.addEventListener('error', handleError)
      video.src = src.hls
      return () => video.removeEventListener('error', handleError)
    }

    let hls: import('hls.js').default | undefined
    let cancelled = false

    import('hls.js').then(({ default: Hls }) => {
      if (cancelled || !Hls.isSupported()) {
        return
      }
      hls = new Hls()
      hls.loadSource(src.hls as string)
      hls.attachMedia(video)
    })

    return () => {
      cancelled = true
      hls?.destroy()
    }
  }, [src.hls])

  return (
    <video
      ref={videoRef}
      poster={poster}
      className={videoStyle}
      style={{ aspectRatio: aspectRatio ?? '16 / 9' }}
      controls
      autoPlay
      playsInline
    >
      {src.mp4 ? <source src={src.mp4} type='video/mp4' /> : null}
    </video>
  )
}

function ConsentGatedEmbed({
  id,
  platform,
  title,
  poster,
  aspectRatio,
}: {
  id: string
  platform: 'youtube' | 'vimeo'
  title?: string
  poster: string
  aspectRatio?: number
}) {
  const { t } = useTranslation()
  const [consented, setConsented] = useState(false)

  if (consented) {
    const embedUrl =
      platform === 'youtube'
        ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
        : `https://player.vimeo.com/video/${id}?autoplay=1`

    return (
      <div
        className={iframeContainerStyle}
        style={{ aspectRatio: aspectRatio ?? '16 / 9' }}
      >
        <iframe
          className={iframeStyle}
          src={embedUrl}
          title={title}
          allow='autoplay; fullscreen'
          allowFullScreen
        />
      </div>
    )
  }

  const playerLabel = t(`styleguide/video/dnt/player/${platform}`)

  return (
    <VideoThumbnail
      poster={poster}
      aspectRatio={aspectRatio}
      label={title ? `Video abspielen: ${title}` : 'Video abspielen'}
      note={t('styleguide/video/dnt/note', {
        player: playerLabel,
        platform: playerLabel,
      })}
      icon={<CirclePlay size={64} className={playIconStyle} />}
      onClick={() => setConsented(true)}
    />
  )
}

function OpenExternallyLink({
  url,
  platform,
  title,
  poster,
  aspectRatio,
}: {
  url: string
  platform?: 'youtube' | 'vimeo'
  title?: string
  poster: string
  aspectRatio?: number
}) {
  const { t } = useTranslation()
  const label = platform
    ? `In ${t(`styleguide/video/dnt/player/${platform}`)} öffnen`
    : 'Video öffnen'

  return (
    <VideoThumbnail
      poster={poster}
      aspectRatio={aspectRatio}
      label={title ? `${label}: ${title}` : label}
      note={label}
      icon={<ExternalLinkIcon size={64} className={playIconStyle} />}
      href={url}
    />
  )
}

export function EmbedVideo({
  value,
}: {
  value: Extract<ArticlePortableTextBlockType, { _type: 'embedVideo' }>
}) {
  const { isNativeApp } = usePlatformInformation()
  const [revealed, setRevealed] = useState(false)

  try {
    const { src, size, aspectRatio, url, thumbnail, title, id, platform } =
      value
    const poster = src?.thumbnail ?? thumbnail

    return (
      <div className={containerStyle({ size })}>
        {src?.mp4 ? (
          revealed || !poster ? (
            <HlsVideo src={src} poster={poster} aspectRatio={aspectRatio} />
          ) : (
            <VideoThumbnail
              poster={poster}
              aspectRatio={aspectRatio}
              label={title ? `Video abspielen: ${title}` : 'Video abspielen'}
              icon={<CirclePlay size={64} className={playIconStyle} />}
              onClick={() => setRevealed(true)}
            />
          )
        ) : id && platform && poster && !isNativeApp ? (
          <ConsentGatedEmbed
            id={stegaClean(id)}
            platform={stegaClean(platform)}
            title={title}
            poster={poster}
            aspectRatio={aspectRatio}
          />
        ) : poster && url ? (
          <OpenExternallyLink
            url={url}
            platform={platform ? stegaClean(platform) : undefined}
            title={title}
            poster={poster}
            aspectRatio={aspectRatio}
          />
        ) : url ? (
          <Link className={linkStyle} href={url} target='_blank' rel='noopener'>
            {url}
          </Link>
        ) : null}
      </div>
    )
  } catch (e) {
    console.error('Video data could not be parsed', e)
  }
  return null
}
