import React, { useRef, CSSProperties, ReactElement, useState } from 'react'
import ReactDOM from 'react-dom'
import { useColorContext } from '../Colors/ColorContext'
import { css } from 'glamor'
import ExpandableLinkCallout from './ExpandableLinkCallout'

type Props = {
  children?: React.ReactNode
  attributes: object
  title: string
  description: string
  href: string
}

export type StateProps = {
  href: string
  title: string
  description: string
  position: CSSProperties
}

const styles = {
  link: css({
    cursor: 'pointer',
    padding: '0 2px',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationSkip: 'ink',
    textDecorationThickness: 2,
    textUnderlineOffset: 3,
  }),
}

const MARGIN = 8
export const DELAY = 300

const Portal: React.FC<{ children: ReactElement }> = ({ children }) => {
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null
}

const ExpandableLink = ({
  children,
  attributes,
  title,
  description,
  href,
}: Props) => {
  const [colorScheme] = useColorContext()
  const [expandedLink, setExpandedLink] = useState<StateProps>(undefined)
  const timeOutRef = useRef<NodeJS.Timeout>(null)

  const toggleLinkInfoBox = (position: CSSProperties) => {
    if (expandedLink) {
      setExpandedLink(undefined)
    } else {
      setExpandedLink({ title, description, href, position: position })
    }
  }

  const getCalloutPosition = (event) => {
    const target = event.target as HTMLAnchorElement
    const targetHeight = target.offsetHeight
    const targetBottom = target.getBoundingClientRect().bottom
    const targetTop = target.getBoundingClientRect().top
    const targetMiddle =
      target.getBoundingClientRect().top + target.offsetHeight / 2
    const isMultiline =
      parseInt(
        window.getComputedStyle(target).getPropertyValue('line-height'),
      ) <= targetHeight
    const hoveringOnTopLine = event.clientY <= targetMiddle
    const displayAbove = event.clientY >= window.innerHeight / 2
    const displayToLeft = event.clientX >= window.innerWidth / 2

    return {
      // if callout renders BELOW target AND
      // if the target link wraps on multiple lines AND
      // the client is hovering on the TOP line of the multi-line wrapped link THEN
      // use the target middle as baseline
      top: displayAbove
        ? 'auto'
        : isMultiline && hoveringOnTopLine
        ? targetMiddle + MARGIN
        : targetBottom + MARGIN,
      // if callout renders ABOVE the target link AND
      // if the target link wraps on multiple lines AND
      // the client is hovering on the BOTTOM line of the multi-line wrapped link THEN
      // use the target middle as baseline
      bottom: displayAbove
        ? isMultiline && !hoveringOnTopLine
          ? window.innerHeight - targetMiddle + MARGIN
          : window.innerHeight - targetTop + MARGIN
        : 'auto',
      left: displayToLeft ? 'auto' : event.clientX,
      right: displayToLeft ? window.innerWidth - event.clientX : 'auto',
    }
  }

  const showInfoBox = (event) => {
    clearTimeout(timeOutRef.current)
    const position = getCalloutPosition(event)
    timeOutRef.current = setTimeout(() => {
      toggleLinkInfoBox(position)
    }, DELAY)
  }

  const removeInfoBox = () => {
    clearTimeout(timeOutRef.current)
    timeOutRef.current = setTimeout(() => setExpandedLink(undefined), DELAY)
  }

  return (
    <a
      {...attributes}
      {...styles.link}
      {...colorScheme.set('color', 'text')}
      {...colorScheme.set('textDecorationColor', 'textSoft')}
      onClick={(event) => {
        event.preventDefault()
        showInfoBox(event)
      }}
      onFocus={() => toggleLinkInfoBox({})}
      onBlur={removeInfoBox}
      onMouseLeave={removeInfoBox}
      onMouseEnter={(event) => {
        showInfoBox(event)
      }}
    >
      {children}
      {expandedLink && (
        <Portal>
          <ExpandableLinkCallout
            timeOutRef={timeOutRef}
            expandedLink={expandedLink}
            setExpandedLink={setExpandedLink}
          />
        </Portal>
      )}
    </a>
  )
}

export default ExpandableLink
