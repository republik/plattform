/**
 * Field builders shared by the comment and user transforms.
 */

/**
 * Mirrors @orbiting/backend-modules-republik/lib/portrait's resize/bw URL
 * building (duplicated rather than depended on, to avoid a cross-package
 * import into a package that otherwise has no dependency on `republik`).
 */
export const getPortraitUrl = (
  portraitUrl: string | null,
): string | undefined => {
  if (!portraitUrl) {
    return undefined
  }
  try {
    const url = new URL(portraitUrl)
    url.searchParams.set('resize', '384x384')
    url.searchParams.set('bw', '1')
    url.searchParams.set('format', 'auto')
    return url.toString()
  } catch {
    return undefined
  }
}

export const toUnixMs = (value: Date | string | number): number =>
  new Date(value).getTime()
