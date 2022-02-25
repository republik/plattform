import React, { useMemo } from 'react'
import {
  BrandMark as R,
  fontFamilies,
  useColorContext,
} from '@project-r/styleguide'
import { css } from 'glamor'

const SPACE = 60

const styles = {
  highlight: css({
    fontFamily: fontFamilies.serifBold,
    fontSize: 24,
    lineHeight: '36px',
  }),
  strong: css({
    fontFamily: fontFamilies.serifBold,
  }),
  column: css({
    maxWidth: 500,
    margin: `${SPACE}px auto`,
  }),
  text: css({
    marginTop: SPACE / 2,
    marginBottom: SPACE,
    fontFamily: fontFamilies.serifRegular,
    fontSize: 18,
    lineHeight: '27px',
  }),
}

const Highlight = ({ children, ...props }) => (
  <span {...props} {...styles.highlight}>
    {children}
  </span>
)
const Strong = ({ children }) => <span {...styles.strong}>{children}</span>

const Manifest = () => {
  const [colorScheme] = useColorContext()
  const colorRule = useMemo(
    () =>
      css({
        color: colorScheme.getCSSColor('default'),
        background: colorScheme.getCSSColor('accentColorMeta'),
        '& ::selection': {
          color: colorScheme.getCSSColor('accentColorMeta'),
          background: colorScheme.getCSSColor('default'),
        },
      }),
    [colorScheme],
  )
  return (
    <div
      style={{
        padding: 20,
        marginTop: SPACE,
        marginBottom: SPACE,
      }}
      {...colorRule}
    >
      <div {...styles.column}>
        <R fill='currentColor' />

        <div {...styles.text}>
          <Highlight>Ohne Journalismus keine Demokratie.</Highlight>
          <br />
          Und ohne Demokratie keine Freiheit. Wenn der Journalismus stirbt,
          stirbt auch die{' '}
          <Strong>
            offene Gesellschaft, das freie Wort, der Wettbewerb der besten
            Argumente. Freier Journalismus
          </Strong>{' '}
          war die erste Forderung der <Strong>liberalen Revolution.</Strong> Und
          das Erste, was jede Diktatur wieder abschafft. Journalismus ist ein
          Kind <Strong>der Aufklärung.</Strong> Seine Aufgabe ist die{' '}
          <Strong>Kritik der Macht.</Strong> Deshalb ist Journalismus mehr als
          nur ein Geschäft für irgendwelche Konzerne. Wer Journalismus macht,
          übernimmt <Strong>Verantwortung für die Öffentlichkeit.</Strong> Denn
          in der Demokratie gilt das Gleiche wie überall im Leben: Menschen
          brauchen{' '}
          <Strong>
            vernünftige Informationen, um vernünftige Entscheidungen zu treffen.
          </Strong>{' '}
          Guter Journalismus schickt{' '}
          <Strong>Expeditionsteams in die Wirklichkeit.</Strong> Seine Aufgabe
          ist, den Bürgerinnen und Bürgern die{' '}
          <Strong>Fakten und Zusammenhänge</Strong> zu liefern, pur,{' '}
          <Strong>unabhängig,</Strong> nach bestem Gewissen,{' '}
          <Strong>ohne Furcht</Strong> vor niemandem als der Langweile.
          Journalismus strebt nach <Strong>Klarheit</Strong>, er ist{' '}
          <Strong>der Feind der uralten Angst vor dem Neuen.</Strong>{' '}
          Journalismus braucht <Strong>Leidenschaft,</Strong> Können und
          Ernsthaftigkeit. Und ein aufmerksames, neugieriges,{' '}
          <Strong>furchtloses Publikum.</Strong>{' '}
          <Highlight style={{ verticalAlign: 'top' }}>Sie!</Highlight>
        </div>
      </div>
    </div>
  )
}

export default Manifest
