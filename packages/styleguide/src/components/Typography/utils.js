export const DEFAULT_FONT_SIZE = 16

export const pxToRem = (pxSize) => {
  return pxSize && `${parseInt(pxSize, 10) / DEFAULT_FONT_SIZE}rem`
}

export const convertStyleToRem = (cssRules) => {
  return {
    ...cssRules,
    fontSize: pxToRem(cssRules.fontSize),
    lineHeight: pxToRem(cssRules.lineHeight),
  }
}
