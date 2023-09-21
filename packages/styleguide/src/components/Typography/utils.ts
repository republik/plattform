export const DEFAULT_FONT_SIZE = 16

export function pxToRem(pxSize: number | string): `${number}rem` | string {
  if (typeof pxSize === 'number') {
    return `${pxSize / DEFAULT_FONT_SIZE}rem`
  }
  return pxSize && `${parseInt(pxSize, 10) / DEFAULT_FONT_SIZE}rem`
}

type CSSRules = {
  fontSize: string
  lineHeight: string
} & React.CSSProperties

export function convertStyleToRem(cssRules: CSSRules): CSSRules {
  return {
    ...cssRules,
    fontSize: pxToRem(cssRules.fontSize),
    lineHeight: pxToRem(cssRules.lineHeight),
  }
}
