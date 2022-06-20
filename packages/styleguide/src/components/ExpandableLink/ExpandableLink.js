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
  const [expandedIdx, setExpandedIdx] = useState(undefined)

  const isOpen = expandedIdx !== undefined

  const toggleLinkInfoBox = () => {
    if (isOpen) {
      setExpandedIdx(undefined)
      setExpandedLinks(expandedLinks.filter((link) => link.href !== href))
    } else {
      const idx = expandedLinks.length
      setExpandedIdx(idx)
      setExpandedLinks(
        expandedLinks.concat({ title, description, href, expandedIdx: idx }),
      )
    }
  }

  useEffect(() => {
    if (!isOpen) return
    if (!expandedLinks.find((link) => link.expandedIdx === expandedIdx)) {
      toggleLinkInfoBox()
    }
  }, [expandedLinks])

  useEffect(() => {
    if (!isOpen) return
    setExpandedLinks(
      expandedLinks.map((link, i) =>
        i === expandedIdx ? { title, description, href } : link,
      ),
    )
  }, [title, description, href])

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
