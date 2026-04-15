import { css } from '@republik/theme/css'
import { Spinner } from '../ui/spinner'

export function NextReadsLoader() {
  return (
    <div
      className={css({
        display: 'flex',
        justifyContent: 'center',
        margin: 32,
      })}
    >
      <Spinner size='large' />
    </div>
  )
}
