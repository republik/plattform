import { css } from '@republik/theme/css'
import Image from 'next/image'

export const Avatar = ({
  portrait,
  initials,
}: {
  portrait?: string
  initials?: string
}) => {
  return (
    <div
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '[36px]',
        height: '[36px]',
        backgroundColor: 'hover',
        color: 'text',
        fontWeight: 'medium',
      })}
    >
      {portrait ? (
        <Image
          src={portrait}
          height={32}
          width={32}
          className={css({
            width: 'full',
            height: 'full',
            objectFit: 'cover',
          })}
          unoptimized
          alt='Portrait'
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
