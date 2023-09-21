import { css, merge } from 'glamor'
import Link from 'next/link'
import { withRouter } from 'next/router'
import { A, fontStyles } from '@project-r/styleguide'

const styles = {
  phase: css({
    color: '#fff',
    padding: '3px 6px',
    display: 'inline-block',
    ...fontStyles.sansSerifRegular14,
    letterSpacing: 0.5,
  }),
  phaseLarge: css({
    margin: '0 6px 6px 0',
    ...fontStyles.sansSerifRegular16,
  }),
}

export const Phase = ({ phase, onClick, disabled, isActive, large, style }) => (
  <div
    {...merge(styles.phase, large && styles.phaseLarge)}
    style={{
      backgroundColor: disabled ? 'gray' : phase.color,
      cursor: onClick ? 'pointer' : 'default',
      opacity: phase.count === 0 && !isActive ? 0.5 : 1,
      ...style,
    }}
    onClick={onClick}
  >
    {phase.label} {phase.count ? `(${phase.count})` : ''}
  </div>
)

const PhaseFilter = withRouter(
  ({
    phases,
    router: {
      query,
      query: { phase },
    },
  }) => (
    <div {...styles.filterBar}>
      {phases.map((p) => {
        const isActive = phase && phase === p.key

        return (
          <Link
            key={p.key}
            href={{
              pathname: '/',
              query: { ...query, phase: isActive ? null : p.key },
            }}
            replace
            scroll={false}
            passHref
            legacyBehavior
          >
            <A>
              <Phase
                phase={p}
                disabled={phase && !isActive}
                isActive={isActive}
                large
                style={{ cursor: 'pointer' }}
              />
            </A>
          </Link>
        )
      })}
    </div>
  ),
)

export default PhaseFilter
