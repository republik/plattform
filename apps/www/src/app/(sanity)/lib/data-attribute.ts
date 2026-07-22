import { dataset, projectId, studioUrl } from '@/app/(sanity)/lib/env'
import { createDataAttribute, type CreateDataAttributeProps } from 'next-sanity'

export function dataAttribute<T extends CreateDataAttributeProps>(
  opts: T,
): string {
  return createDataAttribute({
    projectId,
    dataset,
    baseUrl: studioUrl,
    ...opts,
  }).toString()
}
