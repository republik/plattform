import { studioUrl } from '@/app/(sanity)/lib/env'

export type EditUrlProps = {
  documentId: string
  documentType: string
  path?: string
}
export function editUrl({ documentId, documentType, path }: EditUrlProps) {
  // Edit URL format: <your-studio-url>/intent/edit/id=DOCUMENT_ID;type=DOCUMENT_TYPE;path=FIELD_PATH
  // https://www.sanity.io/docs/visual-editing/studio-edit-intent-links

  return `${studioUrl}/intent/edit/id=${documentId};type=${documentType};path=${
    path ?? '/'
  }`
}
