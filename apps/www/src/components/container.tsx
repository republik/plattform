import { css } from '@app/styled-system/css'

type ContainerProps = {
  children: React.ReactNode
}

export default function Container({ children }: ContainerProps) {
  return (
    <div
      className={css({
        mx: 'auto',
        padding: 16,
        maxWidth: 768,
        width: '100%',
      })}
    >
      {children}
    </div>
  )
}
