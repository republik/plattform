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
        src='https://player.vimeo.com/video/1175425419?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&dnt=1'
        frameBorder='0'
        referrerPolicy='no-referrer'
        allow='autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media'
        sandbox='allow-scripts allow-same-origin'
        title='Frühlingskampagne 2026'
      ></iframe>
    </div>
  )
}
