import React from 'react'
import { useLinkInfoContext } from './LinkInfoContext'
import IconButton from '../IconButton'
import { CloseIcon } from '../Icons'
import RawHtml from '../RawHtml'
import { A } from '../Typography'

const LinkInfo = ({ link }) => {
  const [expandedLinks, setExpandedLinks] = useLinkInfoContext()

  const closeInfo = () => {
    setExpandedLinks(expandedLinks.filter((l) => l.href !== link.href))
  }

  return (
    <div>
      <RawHtml dangerouslySetInnerHTML={{ __html: link.description }} />
      <br />
      <A href={link.href} target='_blank'>
        {link.href}
      </A>
      <IconButton Icon={CloseIcon} onClick={closeInfo} />
    </div>
  )
}

export const LinkInfoBox = () => {
  const [expandedLinks] = useLinkInfoContext()

  if (!expandedLinks.length) return null

  return (
    <div>
      {expandedLinks.map((link, i) => (
        <LinkInfo key={i} link={link} />
      ))}
    </div>
  )
}
