import { Avatar } from '@republik/ui-docs-demo'

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: 20, margin: 50 }}>
      <Avatar
        src='https://fillmurray.lucidinternets.com/200/200'
        alt='Fill Murray'
      />
      <Avatar src='https://placebear.com/200/200' alt='Placebear' />
      <Avatar fallback='AB' />
      <Avatar fallback='DC' color='lightblue' />
      <Avatar fallback='FM' color='hotpink' />
    </div>
  )
}
