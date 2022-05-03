import React from 'react'
import { useLinkInfoContext } from './LinkInfoContext'

const LinkInfo = ({ link }) => (
  <div>
    {link.description}
    <br />
    {link.href}
  </div>
)

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
