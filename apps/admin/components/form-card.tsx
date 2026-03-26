import { css } from '@republik/theme/css'

export function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={css({
        p: '4',
        background: 'hover',
        borderRadius: '[10px]',
      })}
    >
      {children}
    </div>
  )
}
