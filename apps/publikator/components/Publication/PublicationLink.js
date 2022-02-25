import React from 'react'
import LockIcon from 'react-icons/lib/md/lock'
import PublicIcon from 'react-icons/lib/md/public'

import { IconButton } from '@project-r/styleguide'

import { FRONTEND_BASE_URL } from '../../lib/settings'

const PublicationLink = ({ publication }) => {
  if (!publication.live || !publication.document?.meta?.path) {
    return null
  }

  return (
    <IconButton
      Icon={publication.prepublication ? LockIcon : PublicIcon}
      style={{ marginRight: 0 }}
      title={publication.document.meta.title}
      invert
      label={publication.prepublication ? 'Vorschau öffnen' : 'Beitrag öffnen'}
      fillColorName='primary'
      href={`${FRONTEND_BASE_URL}${publication.document.meta.path}`}
      target='_blank'
    />
  )
}

export default PublicationLink
