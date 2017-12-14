import test from 'tape'
import { parse } from '@orbiting/remark-preset'

import {
  INFOBOX_IMAGE_SIZES,
  INFOBOX_DEFAULT_IMAGE_SIZE
} from '../../components/InfoBox'

import {
  PULLQUOTE_IMAGE_SIZE
} from '../../components/PullQuote'

import {
  FIGURE_SIZES
} from '../../components/Figure'

import {
  getDisplayWidth
} from './utils'

const parseFirst = string => parse(string).children[0]

test('article.utils.getDisplayWidth: infobox', assert => {
  const regularInfobox = parseFirst(`
<section><h6>INFOBOX</h6>

![](/static/landscape.jpg?size=2000x1411)

<hr /></section>
  `)

  assert.equal(
    getDisplayWidth(
      [regularInfobox]
    ),
    INFOBOX_IMAGE_SIZES[INFOBOX_DEFAULT_IMAGE_SIZE]
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

  assert.equal(
    getDisplayWidth(
      [mInfobox]
    ),
    INFOBOX_IMAGE_SIZES['M']
  )

  assert.end()
})


test('article.utils.getDisplayWidth: pull quote', assert => {
  const pullQuote = parseFirst(`
<section><h6>QUOTE</h6>

<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

_Foto: Laurent Burst_

<hr /></section>

<hr /></section>
  `)

  assert.equal(
    getDisplayWidth(
      [pullQuote]
    ),
    PULLQUOTE_IMAGE_SIZE
  )

  assert.end()
})


test('article.utils.getDisplayWidth: figure', assert => {
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

  assert.equal(
    getDisplayWidth(
      [figure, center, rootNode]
    ),
    FIGURE_SIZES.center,
    'center figure'
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
  assert.equal(
    getDisplayWidth(
      [breakoutFigure, center, rootNode]
    ),
    FIGURE_SIZES.breakout,
    'center figure'
  )

  const e2eFigureRootNode = parse(`
<section><h6>FIGURE</h6>

![](/static/landscape.jpg?size=2000x1411)

_Foto: Laurent Burst_

<hr /></section>
  `)
  const e2eFigure = e2eFigureRootNode.children[0]

  assert.equal(
    getDisplayWidth(
      [e2eFigure, e2eFigureRootNode]
    ),
    1200,
    'e2e figure'
  )

  assert.end()
})
