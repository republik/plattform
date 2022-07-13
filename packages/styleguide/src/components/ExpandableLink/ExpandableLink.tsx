import React, { useRef, CSSProperties } from 'react'
import { useColorContext } from '../Colors/ColorContext'
import { css } from 'glamor'
import { useLinkInfoContext } from './LinkInfoContext'

type Props = {
  children?: React.ReactNode
  attributes: object
  title: string
  description: string
  href: string
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

const ExpandableLink = ({
  children,
  attributes,
  title,
  description,
  href,
}: Props) => {
  const [colorScheme] = useColorContext()
  const [expandedLink, setExpandedLink, timeOutRef] = useLinkInfoContext()

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

  return (
    <a
      {...attributes}
      {...styles.link}
      {...colorScheme.set('color', 'text')}
      {...colorScheme.set('textDecorationColor', 'textSoft')}
      onClick={(event) => {
        event.preventDefault()
        clearTimeout(timeOutRef.current)
        const position = getCalloutPosition(event)
        timeOutRef.current = setTimeout(() => {
          toggleLinkInfoBox(position)
        }, 300)
      }}
      onFocus={() => toggleLinkInfoBox({})}
      onBlur={() => {
        clearTimeout(timeOutRef.current)
        timeOutRef.current = setTimeout(() => setExpandedLink(undefined), 300)
      }}
      onMouseLeave={() => {
        clearTimeout(timeOutRef.current)
        timeOutRef.current = setTimeout(() => setExpandedLink(undefined), 300)
      }}
      onMouseEnter={(event) => {
        event.preventDefault()
        clearTimeout(timeOutRef.current)
        const position = getCalloutPosition(event)
        timeOutRef.current = setTimeout(() => {
          toggleLinkInfoBox(position)
        }, 300)
      }}
    >
      {children}
    </a>
  )
}

export default ExpandableLink
