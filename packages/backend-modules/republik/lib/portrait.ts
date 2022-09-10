import { User, UserRow } from '@orbiting/backend-modules-types'

interface PortraitArgs {
  size: 'SMALL' | 'SHARE'
  properties: {
    width: number | undefined
    height: number | undefined
    bw: boolean | undefined
  }
}

export const get = (user: UserRow | User, args: PortraitArgs) => {
  const { portraitUrl } = '_raw' in user ? user._raw : user
  if (!portraitUrl) {
    return null
  }

  const { properties } = args

  // resize image
  const resize: string =
    ((properties?.width || properties?.height) &&
      [properties.width ?? '', properties.height ?? ''].join('x')) ||
    (args.size === 'SHARE' && '1000x1000') ||
    '384x384'

  // greyscale image
  const bw = properties?.bw ?? true

  try {
    const url = new URL(portraitUrl)

    url.searchParams.set('resize', resize)
    url.searchParams.set('bw', bw ? '1' : '')
    url.searchParams.set('format', 'auto')

    return url.toString()
  } catch (e: any) {
    console.warn(`republik/lib/portrait %s unparsable: %s`, user.id, e.message)
    return null
  }
}
