'use client'

import { IconCheckCircle, IconSchedule } from '@republik/icons'
import { css, cx } from '@republik/theme/css'
import { useEffect, useRef, useState } from 'react'

const journalismPromiseStyle = css({
  pb: 8,
  '& h3': {
    textStyle: 'campaignSubhead',
    mb: 2,
  },
  '& p': {
    textStyle: 'airy',
  },
  '& .status': {
    fontWeight: 500,
    fontSize: 'medium',
    mt: '2',
  },
})

const pillBase = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1.5,
  pl: 2,
  pr: 4,
  py: 1,
  borderRadius: 'full',
  fontSize: 's',
  fontWeight: 500,
  mb: 4,
  lineHeight: 'tight',
})

const pillFulfilled = css({
  background: 'campaign26.happyCherry',
  color: 'campaign26.frozenYogurt',
})

const pillPending = css({
  background: 'transparent',
  border: '2px solid token(colors.campaign26.happyCherry)',
  color: 'campaign26.happyCherry',
})

const checkIconVisible = css({
  display: 'inline-flex',
  animationName: 'checkBounce',
  animationDuration: '0.5s',
  animationTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  animationDelay: '0.1s',
  animationFillMode: 'both',
})

const checkIconHidden = css({
  display: 'inline-flex',
  transform: 'scale(0)',
  opacity: 0,
})

const pendingIconStyle = css({
  display: 'inline-flex',
  opacity: 0.8,
  animationName: 'clockRock',
  animationDuration: '2.4s',
  animationTimingFunction: 'ease-in-out',
  animationIterationCount: 'infinite',
})

export function JournalismPromise({
  count,
  fulfilled = false,
  children,
}: {
  count: number
  fulfilled?: boolean
  children: React.ReactNode
}) {
  const pillRef = useRef<HTMLSpanElement>(null)
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    const el = pillRef.current
    if (!el || !fulfilled) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimationKey((k) => k + 1)
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [fulfilled])

  return (
    <div className={journalismPromiseStyle}>
      <style>{`
        @keyframes checkBounce {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.35) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes clockRock {
          0%   { transform: rotate(0deg); }
          20%  { transform: rotate(20deg); }
          50%  { transform: rotate(-20deg); }
          80%  { transform: rotate(20deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
      <span
        ref={pillRef}
        className={cx(pillBase, fulfilled ? pillFulfilled : pillPending)}
      >
        {fulfilled ? (
          <span
            key={animationKey}
            className={animationKey > 0 ? checkIconVisible : checkIconHidden}
          >
            <IconCheckCircle size={24} />
          </span>
        ) : (
          <span className={pendingIconStyle}>
            <IconSchedule size={24} />
          </span>
        )}
        Versprechen {count} von 3
      </span>
      {children}
    </div>
  )
}
