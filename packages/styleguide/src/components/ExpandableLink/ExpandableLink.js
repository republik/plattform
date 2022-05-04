import React, { useEffect, useState } from 'react'
import { useColorContext } from '../Colors/ColorContext'
import { css } from 'glamor'
import { useLinkInfoContext } from './LinkInfoContext'
import { underline } from '../../lib/styleMixins'

const link = css({
  cursor: 'pointer',
  padding: '0 2px',
  textDecoration: 'none',
  ...underline,
})

const ExpandableLink = ({ children, attributes, title, description, href }) => {
  const [colorScheme] = useColorContext()
  const [expandedLinks, setExpandedLinks] = useLinkInfoContext()
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    setOpen(expandedLinks.find((link) => link.href === href))
  }, [expandedLinks])

  const toggleLinkInfoBox = () => {
    if (isOpen) {
      setExpandedLinks(expandedLinks.filter((link) => link.href !== href))
    } else {
      setExpandedLinks(expandedLinks.concat({ title, description, href }))
    }
    setOpen(!isOpen)
  }

  return (
    <a
      {...colorScheme.set('color', 'text')}
      {...colorScheme.set('background', 'divider')}
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
