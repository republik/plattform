import React, { useState } from 'react'
import { useColorContext } from '../Colors/ColorContext'
import { css } from 'glamor'
import { useLinkInfoContext } from './LinkInfoContext'

const link = css({
  cursor: 'pointer',
  padding: '0 2px',
  textDecoration: 'none',
})

const ExpandableLink = ({ children, attributes, title, description, href }) => {
  const [colorScheme] = useColorContext()
  const [expandedLinks, setExpandedLinks] = useLinkInfoContext()
  const [isOpen, setOpen] = useState(false)

  const toggleLinkInfoBox = () => {
    const currentlyOpen = expandedLinks.find((link) => link.href === href)
    if (currentlyOpen) {
      setExpandedLinks(expandedLinks.filter((link) => link.href !== href))
    } else {
      setExpandedLinks(expandedLinks.concat({ title, description, href }))
    }
    setOpen(!currentlyOpen)
  }

  return (
    <a
      {...colorScheme.set('color', 'text')}
      {...colorScheme.set('background', 'accentColorOppinion')}
      {...attributes}
      {...link}
      onClick={toggleLinkInfoBox}
    >
      {children}
      <span>&nbsp;{isOpen ? '-' : '+'}</span>
    </a>
  )
}

export default ExpandableLink
