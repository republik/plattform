import { Spinner } from '@/app/components/ui/spinner'
import { css } from '@republik/theme/css'

export default function ArchiveMonthLoading() {
  return (
    <div
      className={css({ display: 'flex', justifyContent: 'center', py: '16' })}
    >
      <Spinner size='large' />
    </div>
  )
}
