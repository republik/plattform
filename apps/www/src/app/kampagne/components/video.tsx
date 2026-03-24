'use client'

import { css } from '@republik/theme/css'

export function Video() {
  return (
    <div
      className={css({
        '& iframe': {
          aspectRatio: '9/16',
          width: '100%',
          height: 'auto',
        },
      })}
    >
      <iframe
        src='https://player.vimeo.com/video/1175425419'
        frameBorder='0'
        referrerPolicy='no-referrer'
        allow='autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media'
        sandbox='allow-scripts allow-same-origin allow-presentation'
        title='Frühlingskampagne 2026'
      ></iframe>
    </div>
  )
}
