import { rgb } from 'd3-color'
import { Label } from '@project-r/styleguide'
import withT from '../../../lib/withT'
import { swissNumbers } from '../../../lib/utils/format'

// see https://www.w3.org/TR/WCAG20/#relativeluminancedef
const convertDomain = (x) => {
  const xNorm = x / 255
  if (xNorm <= 0.03928) {
    return xNorm / 12.92
  }
  const base = (xNorm + 0.055) / 1.055
  return Math.pow(base, 2.4)
}

const getRelativeLuminance = (color) => {
  const { r, g, b } = rgb(color)
  const r1 = convertDomain(r)
  const g1 = convertDomain(g)
  const b1 = convertDomain(b)
  return 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1
}

const getColorContrast = (color1, color2) => {
  const rl1 = getRelativeLuminance(color1)
  const rl2 = getRelativeLuminance(color2)
  const rlmax = rl1 > rl2 ? rl1 : rl2
  const rlmin = rl1 <= rl2 ? rl1 : rl2
  return (rlmax + 0.05) / (rlmin + 0.05)
}

const formatOneDecimal = swissNumbers.format('.1f')
// WCAG 2.0 level AA standard, for large text
// minimum contrast level 3:1
export const ContrastInfo = withT(({ t, color, bgColor }) => {
  const contrast = color && bgColor && getColorContrast(color, bgColor)
  const warning = Math.round(contrast * 10) / 10 < 3
  return (
    <div style={{ margin: '5px 0', opacity: contrast ? 1 : 0 }}>
      <Label>{t('colorPicker/contrastInfo/title')}</Label>
      <br />
      <span style={{ marginRight: 10 }}>
        {formatOneDecimal(contrast)}&thinsp;:&thinsp;1
      </span>
      {t(`colorPicker/contrastInfo/${warning ? 'warning' : 'ok'}`)}
    </div>
  )
})

export default ContrastInfo
