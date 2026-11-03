import {
  currentZurichMonth,
  MIN_YEAR as ARCHIVE_START_YEAR,
} from '@/app/(sanity)/archiv/lib/month-range'
import Link from '@/app/components/ui/link'
import { css } from '@republik/theme/css'
import { CircleCheckBig } from 'lucide-react'
import { Fragment } from 'react'

const linkStyle = css({ textDecoration: 'underline' })

export function EndOfFront() {
  const now = currentZurichMonth()
  const archiveYears = Array.from(
    { length: now.year - ARCHIVE_START_YEAR + 1 },
    (_, i) => ARCHIVE_START_YEAR + i,
  )

  return (
    <div
      data-theme='dark'
      style={{ backgroundColor: '#000000' }}
      className={css({
        display: 'flex',
        color: 'text',
        flexDirection: 'column',
        gap: '4',
        padding: '8',
        alignItems: 'center',
      })}
    >
      <div className={css({ display: 'flex', gap: '2' })}>
        <CircleCheckBig size={24} /> Sie haben die aktuelle Republik gelesen.
      </div>
      <div>
        <Link href='/feed' className={linkStyle}>
          Zum Feed
        </Link>
      </div>
      <div>
        Archiv{' '}
        {archiveYears.map((year, i) => (
          <Fragment key={year}>
            {i > 0 && ', '}
            <Link href={`/archiv/${year}/1`} className={linkStyle}>
              {year}
            </Link>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
