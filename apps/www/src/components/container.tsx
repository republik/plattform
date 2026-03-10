import { css, cx } from '@republik/theme/css'

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cx(
        css({
          mx: 'auto',
          px: '4',
          maxWidth: 'maxContentWidth',
          width: 'full',
        }),
        className,
      )}
    >
      {children}
    </div>
  )
}

export function ContainerNarrow({ children }: ContainerProps) {
  return (
    <div
      className={css({
        mx: 'auto',
        px: '4',
        maxWidth: 'content.narrow',
        width: 'full',
      })}
    >
      {children}
    </div>
  )
}
