import {
  currentZurichMonth,
  MIN_YEAR as ARCHIVE_START_YEAR,
} from '@/app/(sanity)/archiv/lib/month-range'
import Link from '@/app/components/ui/link'
import { css } from '@republik/theme/css'
import { CircleCheckBig } from 'lucide-react'

export function EndOfFront() {
  const now = currentZurichMonth()
  const archiveYears = Array.from(
    { length: now.year - ARCHIVE_START_YEAR + 1 },
    (_, i) => ARCHIVE_START_YEAR + i,
  )

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4',
        padding: '8',
        alignItems: 'center',
      })}
    >
      <div className={css({ display: 'flex', gap: '2' })}>
        <CircleCheckBig size={24} /> Sie haben die aktuelle Republik gelesen.
        <Link href='/feed'>Zum Feed</Link>
      </div>
      <div>
        Archiv:
        {archiveYears.map((year) => (
          <Link href={`/archiv/${year}/1`}>{year}</Link>
        ))}
      </div>
    </div>
  )
}
