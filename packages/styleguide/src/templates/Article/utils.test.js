import { parse } from '@orbiting/remark-preset'

import {
  INFOBOX_IMAGE_SIZES,
  INFOBOX_DEFAULT_IMAGE_SIZE,
} from '../../components/InfoBox'

import { PULLQUOTE_IMAGE_SIZE } from '../../components/PullQuote'

import { FIGURE_SIZES } from '../../components/Figure'

import { getDisplayWidth } from './utils'

const parseFirst = (string) => parse(string).children[0]

describe('article utils test-suite', () => {
  test('article.utils.getDisplayWidth: infobox', () => {
    const regularInfobox = parseFirst(`
<section><h6>INFOBOX</h6>

![](/static/landscape.jpg?size=2000x1411)

<hr /></section>
  `)

    expect(getDisplayWidth([regularInfobox])).toBe(
      INFOBOX_IMAGE_SIZES[INFOBOX_DEFAULT_IMAGE_SIZE],
    )

    const mInfobox = parseFirst(`
<section><h6>INFOBOX</h6>

\`\`\`
{"figureSize": "M"}
\`\`\`

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

<hr /></section>

<hr /></section>
  `)

    expect(getDisplayWidth([mInfobox])).toBe(INFOBOX_IMAGE_SIZES['M'])
  })

  test('article.utils.getDisplayWidth: pull quote', () => {
    const pullQuote = parseFirst(`
<section><h6>QUOTE</h6>

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

_Foto: Laurent Burst_

<hr /></section>

<hr /></section>
  `)
    expect(getDisplayWidth([pullQuote])).toBe(PULLQUOTE_IMAGE_SIZE)
  })

  test('article.utils.getDisplayWidth: figure', () => {
    const rootNode = parse(`
<section><h6>CENTER</h6>

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

_Foto: Laurent Burst_

<hr /></section>

<hr /></section>
  `)
    const center = rootNode.children[0]
    const figure = center.children[0]

    expect(getDisplayWidth([figure, center, rootNode])).toBe(
      FIGURE_SIZES.center,
    )

    const breakoutFigure = parseFirst(`
<section><h6>FIGURE</h6>

\`\`\`
{"size": "breakout"}
\`\`\`

![](/static/landscape.jpg?size=2000x1411)

Etwas Böses _Foto: Laurent Burst_

<hr /></section>
  `)
    expect(getDisplayWidth([breakoutFigure, center, rootNode])).toBe(
      FIGURE_SIZES.breakout,
    )

    const e2eFigureRootNode = parse(`
<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

_Foto: Laurent Burst_

<hr /></section>
  `)
    const e2eFigure = e2eFigureRootNode.children[0]

    expect(getDisplayWidth([e2eFigure, e2eFigureRootNode])).toBe(1200)
  })
})
