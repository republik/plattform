export const DEFAULT_FONT_SIZE = 16

const pxToRem = (pxSize, baseFontSize = DEFAULT_FONT_SIZE) => {
    return pxSize && (parseInt(pxSize) / baseFontSize + 'rem')
}

export const convertStyleToRem = (cssRules, baseFontSize = DEFAULT_FONT_SIZE) => {
    return {
        ...cssRules,
        fontSize: pxToRem(cssRules.fontSize, baseFontSize),
        lineHeight: pxToRem(cssRules.lineHeight, baseFontSize)
    }
}
