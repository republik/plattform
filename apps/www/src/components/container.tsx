import { css } from '@app/styled-system/css'

type ContainerProps = {
  children: React.ReactNode
}

export default function Container({ children }: ContainerProps) {
  return (
    <div
      className={css({
        mx: 'auto',
        padding: '2',
        maxWidth: 'maxContentWidth',
        width: 'full',
      })}
    >
      {children}
    </div>
  )
}
