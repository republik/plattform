import { css } from '@app/styled-system/css'

export default function Layout(props: {
  children: React.ReactNode
  overlay: React.ReactNode
}) {
  return (
    <div
      className={css({
        p: '4',
        color: 'text',
      })}
      style={{
        minHeight: 'calc(100dvh - 69px)',
      }}
    >
      {props.children}
      {props.overlay}
    </div>
  )
}
