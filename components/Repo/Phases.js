import React from 'react'
import { css } from 'glamor'
import { Link } from '../../lib/routes'
import { withRouter } from 'next/router'

const styles = {
  phase: css({
    color: '#fff',
    borderRadius: 3,
    padding: '3px 6px',
    marginRight: 6,
    display: 'inline-block'
  })
}

export const Phase = ({ phase, onClick, disabled, isActive }) => (
  <div
    {...styles.phase}
    style={{
      backgroundColor: disabled ? 'gray' : phase.color,
      cursor: onClick ? 'pointer' : 'default',
      opacity: phase.count === 0 && !isActive ? 0.5 : 1
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
      query: { phase }
    }
  }) => (
    <div {...styles.filterBar}>
      {phases.map(p => {
        const isActive = phase && phase === p.key

        return (
          <Link
            key={p.key}
            route='index'
            replace
            scroll={false}
            params={{ ...query, phase: isActive ? null : p.key }}
          >
            <Phase
              phase={p}
              disabled={phase && !isActive}
              isActive={isActive}
            />
          </Link>
        )
      })}
    </div>
  )
)

export default PhaseFilter
