import { withRouter } from 'next/router'

import {
  Editorial,
  BrandMark as R,
  NarrowContainer,
} from '@project-r/styleguide'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'
import { withDefaultSSR } from '../lib/apollo/helpers'
import Frame from 'components/Frame'

const Page = ({ router }) => {
  const meta = {
    title: 'Das Manifest der Republik',
    description: 'Ohne Journalismus keine Demokratie.',
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/manifest.png`,
    url: `${PUBLIC_BASE_URL}${router.pathname}`,
  }

  return (
    <Frame meta={meta} raw hasOverviewNav stickySecondaryNav={true}>
      <NarrowContainer
        style={{
          marginTop: '48px',
          marginBottom: '64px',
          display: 'flex',
          flexDirection: 'column',
          gap: '48px',
        }}
      >
        <R />
        <div>
          <Editorial.Headline>
            Ohne Journalismus keine Demokratie.
          </Editorial.Headline>

          <Editorial.P>
            Und ohne Demokratie keine Freiheit. Wenn der Journalismus stirbt,
            stirbt auch die{' '}
            <Editorial.Emphasis>
              offene Gesellschaft, das freie Wort, der Wettbewerb der besten
              Argumente. Freier Journalismus
            </Editorial.Emphasis>{' '}
            war die erste Forderung der{' '}
            <Editorial.Emphasis>liberalen Revolution.</Editorial.Emphasis> Und
            das Erste, was jede Diktatur wieder abschafft. Journalismus ist ein
            Kind <Editorial.Emphasis>der Aufklärung.</Editorial.Emphasis> Seine
            Aufgabe ist die{' '}
            <Editorial.Emphasis>Kritik der Macht.</Editorial.Emphasis> Deshalb
            ist Journalismus mehr als nur ein Geschäft für irgendwelche
            Konzerne. Wer Journalismus macht, übernimmt{' '}
            <Editorial.Emphasis>
              Verantwortung für die Öffentlichkeit.
            </Editorial.Emphasis>{' '}
            Denn in der Demokratie gilt das Gleiche wie überall im Leben:
            Menschen brauchen{' '}
            <Editorial.Emphasis>
              vernünftige Informationen, um vernünftige Entscheidungen zu
              treffen.
            </Editorial.Emphasis>{' '}
            Guter Journalismus schickt{' '}
            <Editorial.Emphasis>
              Expeditionsteams in die Wirklichkeit.
            </Editorial.Emphasis>{' '}
            Seine Aufgabe ist, den Bürgerinnen und Bürgern die{' '}
            <Editorial.Emphasis>Fakten und Zusammenhänge</Editorial.Emphasis> zu
            liefern, pur, <Editorial.Emphasis>unabhängig,</Editorial.Emphasis>{' '}
            nach bestem Gewissen,{' '}
            <Editorial.Emphasis>ohne Furcht</Editorial.Emphasis> vor niemandem
            als der Langweile. Journalismus strebt nach{' '}
            <Editorial.Emphasis>Klarheit</Editorial.Emphasis>, er ist{' '}
            <Editorial.Emphasis>
              der Feind der uralten Angst vor dem Neuen.
            </Editorial.Emphasis>{' '}
            Journalismus braucht{' '}
            <Editorial.Emphasis>Leidenschaft,</Editorial.Emphasis> Können und
            Ernsthaftigkeit. Und ein aufmerksames, neugieriges,{' '}
            <Editorial.Emphasis>furchtloses Publikum.</Editorial.Emphasis>
          </Editorial.P>
          <Editorial.Subhead>Sie!</Editorial.Subhead>
        </div>
      </NarrowContainer>
    </Frame>
  )
}

export default withDefaultSSR(withRouter(Page))
