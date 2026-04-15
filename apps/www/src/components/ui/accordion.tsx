'use client'

import { createContext, useContext } from 'react'
import { css } from '@republik/theme/css'

const styles = {

  item: css({
    borderTopWidth: 1,
    borderColor: 'divider',
    '&:first-child': { borderTopWidth: 0 },
    '&[open] summary svg': {
      transform: 'rotate(180deg)',
    },
  }),
  trigger: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 'full',
    paddingY: '4',
    cursor: 'pointer',
    listStyle: 'none',
    'details[open] > &': { paddingBottom: '1' },
    '&::-webkit-details-marker': { display: 'none' },
    '& svg': {
      flexShrink: 0,
      transition: '[transform 200ms ease]',
    },
  }),
  content: css({
    paddingBottom: '4',
  }),
}

const Chevron = () => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' aria-hidden>
    <path
      d='M3 5.5L8 10.5L13 5.5'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

const AccordionContext = createContext('accordion')

type DivProps = React.HTMLAttributes<HTMLDivElement>
type DetailsProps = React.HTMLAttributes<HTMLDetailsElement>
type SummaryProps = React.HTMLAttributes<HTMLElement>

export function Accordion({
  children,
  name = 'accordion',
  className,
  ...props
}: DivProps & { name?: string }) {
  return (
    <AccordionContext.Provider value={name}>
      <div className={className} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({ children, className, ...props }: DetailsProps) {
  const name = useContext(AccordionContext)
  return (
    <details
      name={name}
      className={[styles.item, className].filter(Boolean).join(' ')}
      {...(props as object)}
    >
      {children}
    </details>
  )
}

export function AccordionTrigger({ children, className, ...props }: SummaryProps) {
  return (
    <summary className={[styles.trigger, className].filter(Boolean).join(' ')} {...props}>
      {children}
      <Chevron />
    </summary>
  )
}

export function AccordionContent({ children, className, ...props }: DivProps) {
  return (
    <div className={[styles.content, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
}
