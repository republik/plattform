import props from '@republik/ui-docs-demo/src/avatar/avatar?props'
import { Avatar } from '@republik/ui-docs-demo'

export default function Page() {
  return (
    <div>
      <Avatar color='hotpink' />
      <pre>{JSON.stringify(props.Avatar, null, 2)}</pre>
    </div>
  )
}
