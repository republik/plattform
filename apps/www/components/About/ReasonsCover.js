import { useState, useEffect } from 'react';

import { css } from 'glamor'

import { inQuotes, fontStyles } from '@project-r/styleguide'
import { getRandomReason } from '../Crowdfunding/reasonData'

const WIDTH = 1200
const HEIGHT = 628

const styles = {
  container: css({
    position: 'relative',
    height: 0,
    width: '100%',
    paddingBottom: `${(HEIGHT / WIDTH) * 100}%`,
    background: 'black',
  }),
  svg: css({
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
  }),
}

const ReasonsCover = () => {
  const [reason, setReason] = useState(undefined)
  const [formatting, setFormatting] = useState({
    lines: [],
    textHeight: 0,
    topOffset: HEIGHT / 2,
  })

  useEffect(() => {
    const reason = getRandomReason()
    const text = inQuotes(reason.text)
    const words = text.split(' ')
    const lines = words.reduce((ls, word, i) => {
      let line = ls[ls.length - 1]
      const lineLength = line && line.join(' ').length
      if (
        !line ||
        (((lineLength + word.length > 20 && lineLength > 3) ||
          (i === 2 && words.length === 4) ||
          (i === 3 && words.length === 5) ||
          (word.length === 2 && line.join(' ').length > 12)) &&
          word.length > 1 &&
          (i !== words.length - 1 || lineLength + word.length > 24))
      ) {
        line = []
        ls.push(line)
      }
      line.push(word)
      return ls
    }, [])
    const maxLineLength = lines.reduce(
      (n, line) => Math.max(n, line.join(' ').length),
      0,
    )
    const fontSize =
      text.length > 70
        ? text.length > 110 || lines.length > 4
          ? lines.length > 6
            ? 35
            : 40
          : 60
        : maxLineLength > 20 || lines.length > 3
        ? 60
        : 80

    const textHeight = fontSize * 1.1 * lines.length + 100
    const remainingSpace = HEIGHT - textHeight - 100 - 120
    const topOffset = 80 + remainingSpace / 2
    setReason(reason)
    setFormatting({
      lines,
      fontSize,
      topOffset,
      textHeight,
    })
  }, [])

  return (
    <div {...styles.container}>
      <svg {...styles.svg} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <rect x='0' y='0' width={WIDTH} height={HEIGHT} fill='#000' />
        {reason && (
          <text fill='#fff' y={formatting.topOffset}>
            <tspan
              style={fontStyles.sansSerifRegular}
              fontSize={20}
              x={WIDTH / 2}
              textAnchor='middle'
            >
              Grund {reason.order + 1} von 101
            </tspan>
            {formatting.lines.map((line, i) => (
              <tspan
                key={i}
                style={fontStyles.serifTitle}
                fontSize={formatting.fontSize}
                dy={i === 0 ? '1.2em' : '1.1em'}
                x={WIDTH / 2}
                textAnchor='middle'
              >
                {line.join(' ')}
              </tspan>
            ))}
            <tspan
              dy='3em'
              fontSize={20}
              style={fontStyles.sansSerifRegular}
              x={WIDTH / 2}
              textAnchor='middle'
            >
              Leser{reason.order % 2 ? '' : 'in'} aus{' '}
              {reason.metadata.originLong}
            </tspan>
          </text>
        )}

        <g
          transform={`translate(${WIDTH / 2 - 13} ${
            formatting.topOffset + formatting.textHeight + 20
          }) scale(1.5)`}
        >
          <path d='M25.956 18.188L.894 35.718V.66' fill='#fff' />
        </g>
      </svg>
    </div>
  )
}

export default ReasonsCover
