'use client'

import type { ArticlePortableTextBlockType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { useHlsSource } from '@/app/(sanity)/components/portable-text/hooks/useHlsSource'
import type { LegacyAudioSrc } from '@/sanity.types'
import { css } from '@republik/theme/css'
import { useRef } from 'react'

const containerStyle = css({
  width: 'full',
})

const audioStyle = css({
  width: 'full',
  display: 'block',
})

const titleStyle = css({
  marginBottom: '4px',
})

function HlsAudio({ src }: { src: LegacyAudioSrc }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  useHlsSource(audioRef, src.hls, src.mp4)

  return (
    <audio ref={audioRef} className={audioStyle} controls>
      {src.mp4 ? <source src={src.mp4} type='audio/mp4' /> : null}
    </audio>
  )
}

export function AudioEmbed({
  value,
}: {
  value: Extract<ArticlePortableTextBlockType, { _type: 'audio' }>
}) {
  try {
    const { fileUrl, legacyAudioSrc, title } = value

    // Uploaded file (the only way to create a new audio block) takes
    // priority; legacyAudioSrc only exists on content migrated from old
    // Publikator embedVideo blocks that had forceAudio set.
    const body = fileUrl ? (
      <audio className={audioStyle} controls src={fileUrl} />
    ) : legacyAudioSrc?.mp4 ? (
      <HlsAudio src={legacyAudioSrc} />
    ) : null

    if (!body) {
      return null
    }

    return (
      <div className={containerStyle}>
        {title ? <p className={titleStyle}>{title}</p> : null}
        {body}
      </div>
    )
  } catch (e) {
    console.error('Audio data could not be parsed', e)
  }
  return null
}
