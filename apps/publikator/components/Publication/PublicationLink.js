import { IconLock, IconPublic } from '@republik/icons'

import { IconButton } from '@project-r/styleguide'

import { FRONTEND_BASE_URL } from '../../lib/settings'

const PublicationLink = ({ publication }) => {
  if (!publication.live || !publication.document?.meta?.path) {
    return null
  }

  const baseUrl =
    publication.document?.meta?.format?.meta?.externalBaseUrl ||
    FRONTEND_BASE_URL

  return (
    <IconButton
      Icon={publication.prepublication ? IconLock : IconPublic}
      style={{ marginRight: 0 }}
      size={24}
      title={publication.document.meta.title}
      invert
      label={publication.prepublication ? 'Vorschau öffnen' : 'Beitrag öffnen'}
      labelShort=''
      fillColorName='primary'
      href={`${baseUrl}${publication.document.meta.path}`}
      target='_blank'
    />
  )
}

export default PublicationLink
