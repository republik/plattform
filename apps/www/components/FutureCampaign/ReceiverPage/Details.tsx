import { motion } from 'framer-motion'
import { css } from 'glamor'
import { ReactNode, useState } from 'react'

type DetailsProps = {
  summary: ReactNode
  iconOpen: ReactNode
  iconClose: ReactNode
  children: ReactNode
}

export const Details = ({
  summary,
  children,
  iconClose,
  iconOpen,
}: DetailsProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [animation, setAnimation] = useState<'opening' | 'closing' | null>(null)

  return (
    <details
      {...styles.details}
      open={isOpen}
      onClick={(e) => {
        e.preventDefault()
        if (isOpen) {
          setAnimation('closing')
        } else {
          setIsOpen(true)
          setAnimation('opening')
        }
      }}
    >
      <summary {...styles.summary}>
        {summary}
        <span {...styles.icon}>
          {isOpen && animation !== 'closing' ? iconClose : iconOpen}
        </span>
      </summary>
      <motion.div
        {...styles.content}
        animate={{ height: isOpen && animation !== 'closing' ? 'auto' : 0 }}
        transition={{
          type: 'spring',
          bounce: 0.1,
          duration: 0.5,
        }}
        onAnimationComplete={() => {
          if (animation === 'closing') {
            setIsOpen(false)
          }
          setAnimation(null)
        }}
      >
        {children}
      </motion.div>
    </details>
  )
}

const styles = {
  details: css({}),
  summary: css({
    display: 'flex',
    justifyContent: 'space-between',
    cursor: 'pointer',

    listStyle: 'none',
    '::marker': { display: 'none' },
    '::-webkit-details-marker': { display: 'none' },
  }),
  icon: css({
    flexShrink: 0,
  }),
  content: css({
    overflow: 'hidden',
  }),
}
