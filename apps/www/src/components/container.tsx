import { css } from '@republik/theme/css'

type ContainerProps = {
  children: React.ReactNode
}

export default function Container({ children }: ContainerProps) {
  return (
    <div
      className={css({
        mx: 'auto',
        px: '4',
        maxWidth: 'maxContentWidth',
        width: 'full',
      })}
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
