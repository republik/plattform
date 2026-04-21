import { css } from '@republik/theme/css'

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={css({
        // p: '4',
        // background: 'hover',
        // borderRadius: '[10px]',
        // border: '1px solid',
        // borderColor: 'divider',

        display: 'flex',
        flexDirection: 'column',
        gap: '4',
      })}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className={css({
        fontSize: 'l',
        fontWeight: 'medium',
      })}
    >
      {children}
    </h2>
  )
}
