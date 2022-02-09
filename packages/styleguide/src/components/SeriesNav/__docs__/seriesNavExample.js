import React from 'react'
import { Interaction } from '../../Typography'
import { useColorContext } from '../../Colors/ColorContext'

export const repoId = '3'
export const series = {
  title: 'Eyes Wide Shut',
  logo: '/static/50Jahre_Frauenwahlrecht_positiv.svg?size=500x500',
  logoDark: '/static/50Jahre_Frauenwahlrecht_negativ.svg?size=500x500',
  description:
    'Wieso sind Verschwörungs­theorien plötzlich allgegenwärtig? Wie entstehen sie, was verbindet sie?',
  overview: {
    repoId: '0',
    meta: {
      path: '/path-to-series-overview',
    },
  },
  episodes: [
    {
      title:
        'Verschwörungs­glaube – woher er kommt, wie er wirkt, was er anrichtet',
      label: 'Auftakt',
      lead: 'Das ist ein Lead. Er kann über mehrere Zeilen lang sein. Nicht nur zwei, sondern drei oder mehr. Imfall. Ja so ist das',
      image:
        'https://cdn.repub.ch/s3/republik-assets/repos/republik/article-eyes-wide-shut-intro/images/46aa5bada5040b2faf3d1ba7d4e05d529f0275e2.jpeg?size=1706x1280',
      document: {
        repoId: '1',
        meta: {
          path: '/2021/01/05/eyes-wide-shut',
        },
      },
    },
    {
      title: 'Willkommen im Fledermausland',
      label: 'Folge 1',
      lead: 'Das ist ein Lead. Er kann über mehrere Zeilen lang sein. Nicht nur zwei.',
      image:
        'https://cdn.repub.ch/s3/republik-assets/repos/republik/article-eyes-wide-shut-intro/images/f5089e65d1098452dbf160ebd8d883045f7d83c4.jpeg?size=1648x1236',
      document: {
        repoId: '2',
        meta: {
          path: '/2021/01/05/willkommen-im-fledermausland',
        },
      },
    },
    {
      title: 'Und plötzlich all diese Helikopter am Himmel',
      label: 'Folge 2',
      lead: 'Das ist ein Lead. Er kann über mehrere Zeilen lang sein. Nicht nur zwei, sondern drei oder mehr. Imfall. Ja so ist das. Aber nicht zu lang, sonst wirkt es nicht so gut. Imfall',
      image:
        'https://cdn.repub.ch/s3/republik-assets/repos/republik/article-eyes-wide-shut-intro/images/e008f9cfe43f8050e1e7172cae31bd25ba28f1ff.jpeg?size=1920x1440',
      document: {
        repoId: '3',
        meta: {
          path: '/2021/01/08/und-ploetzlich-all-diese-helikopter-am-himmel',
        },
      },
    },
    {
      title: 'Wir töten die halbe Menschheit',
      label: 'Folge 3',
      lead: 'Das ist ein Lead. Er kann über mehrere Zeilen lang sein. Nicht nur zwei, sondern drei oder mehr. Imfall. Ja so ist das',
      image:
        'https://cdn.repub.ch/s3/republik-assets/repos/republik/article-eyes-wide-shut-intro/images/376d8819e818421b3c4f033092843005dfe49fcb.jpeg?size=1788x1341',
      document: {
        repoId: '4',
        meta: {
          path: '/2021/01/12/wir-toeten-die-halbe-menschheit',
        },
      },
    },
    {
      title: 'True Lies',
      label: 'Folge 4',
      lead: 'Das ist ein Lead. Er kann über mehrere Zeilen lang sein. ',
      image:
        'https://cdn.repub.ch/s3/republik-assets/repos/republik/article-eyes-wide-shut-intro/images/31e3bc250353d02dd8ad1f2e38f0c8fa9b603331.jpeg?size=1440x1080',
      document: null,
    },
  ],
}

export const TestPayNote = ({ inline }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      style={{ height: '100%', padding: inline ? 5 : undefined }}
      {...colorScheme.set('backgroundColor', 'default')}
    >
      <Interaction.P>Jetzt Probelesen</Interaction.P>
    </div>
  )
}
