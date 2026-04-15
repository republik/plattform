'use client'

import { css } from '@republik/theme/css'
import Image from 'next/image'

function PaynoteAuthor({ author }) {
  if (!author) return null

  return (
    <div
      className={css({
        display: 'grid',
        gridTemplateColumns: '80px 1fr',
        placeItems: 'center start',
        gap: '4',

        textStyle: 'sansSerifRegular',
      })}
    >
      <Image
        src={author.portrait.url}
        unoptimized
        alt='Portraitbild'
        width={160}
        height={160}
        className={css({
          borderRadius: 'full',
        })}
      />

      <div>
        <div className={css({ fontWeight: 'medium' })}>{author.name}</div>
        <div>{author.description}</div>
      </div>
    </div>
  )
}

export default PaynoteAuthor
