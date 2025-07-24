import { css } from '@republik/theme/css'
import { getImgSrc } from 'components/Overview/utils'

export function TeaserBlock({ teasers, path }) {
  return (
    <div
      className={css({
        display: 'grid',
        gap: '4',
        gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`,
      })}
    >
      {teasers.map((teaser) => {
        return (
          <div key={teaser.id}>
            <img
              alt=''
              loading='lazy'
              className={css({
                maxWidth: '100%',
                background: 'overlay',
                minHeight: '100px',
              })}
              src={getImgSrc(teaser, path)}
            ></img>
          </div>
        )
      })}
    </div>
  )
}
