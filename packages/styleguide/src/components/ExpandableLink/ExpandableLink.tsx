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

    // link wraps over multiple lines if the css line-height is smaller than the target height
    const isMultiline =
      parseInt(
        window.getComputedStyle(target).getPropertyValue('line-height'),
      ) <= targetHeight

    // check if we are hovering over the top line
    const hoveringOverTopLine = event.clientY <= targetMiddle
    // when hovering over the top line, displaybelow should use middle, else top
    // when hovering over the bottom line, displayabove shoul duse middle, else bottom
    const displayAbove = event.clientY >= window.innerHeight / 2
    const displayToLeft = event.clientX >= window.innerWidth / 2

    return {
      top: displayAbove
        ? 'auto'
        : // if callout should render BELOW target, check if we are hovering over the
        // top line of a multi-line wrapped link. If so, use the target middle as baseline
        isMultiline && hoveringOverTopLine
        ? targetMiddle + MARGIN
        : targetBottom + MARGIN,
      bottom: displayAbove
        ? // if callout should render ABOVE target, check if we are hovering over the
          // bottom line of a multi-line wrapped link. If so, use the target middle as baseline
          isMultiline && !hoveringOverTopLine
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
      onBlur={() => toggleLinkInfoBox({})}
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
