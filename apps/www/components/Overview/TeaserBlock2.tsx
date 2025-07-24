import { css } from '@republik/theme/css'
import { getImgSrc } from 'components/Overview/utils'
import Image from 'next/image'
import Link from 'next/link'

export function TeaserBlock({ teasers, path, highlight }) {
  return (
    <div
      className={css({
        display: 'grid',
        gap: '4',
        gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`,
      })}
    >
      {teasers.map((teaser) => {
        const data = teaser.nodes[0]?.data
        return (
          <Link
            key={teaser.id}
            className={css({
              position: 'relative',
              width: 'full',
              aspectRatio: '3/2',
            })}
            href={data.url}
          >
            <Image
              src={getImgSrc(teaser, path)}
              unoptimized
              alt=''
              fill
              className={css({
                objectFit: 'contain',
              })}
              style={{
                opacity: highlight && !highlight(data) ? 0.4 : 1,
              }}
            />
          </Link>
        )
      })}
    </div>
  )
}
