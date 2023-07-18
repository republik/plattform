import { css } from 'glamor'
import React, { ReactNode } from 'react'

// TODO: these should be out of the SG and usable by story components
export const COLOR_LABEL_EVENTS = {
  enter: 'enterColorLabel',
  leave: 'leaveColorLabel',
}

export const ColorLabel = ({
  color,
  children,
}: {
  color: string
  children: ReactNode
}) => {
  const eventsParams = {
    bubbles: true,
    detail: { color },
  }

  return (
    <span
      {...styles.container}
      onMouseEnter={() => {
        const event = new CustomEvent(COLOR_LABEL_EVENTS.enter, eventsParams)
        document.dispatchEvent(event)
      }}
      onMouseLeave={() => {
        const event = new CustomEvent(COLOR_LABEL_EVENTS.leave, eventsParams)
        document.dispatchEvent(event)
      }}
    >
      <span {...styles.highlight}>
        <span
          {...styles.circle}
          style={{ backgroundColor: color }}
          contentEditable={false}
        />
        {children}
      </span>
    </span>
  )
}

const styles = {
  container: css({
    display: 'inline-block',
    verticalAlign: 'text-top',
    padding: '0 5px',
  }),
  highlight: css({
    whiteSpace: 'nowrap',
    margin: '-1px 0 1px 0',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '0.3em',
    padding: '0.2em',
    lineHeight: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  }),
  circle: css({
    display: 'inline-block',
    borderRadius: '50%',
    width: '12px',
    height: '12px',
    marginRight: '5px',
  }),
}
