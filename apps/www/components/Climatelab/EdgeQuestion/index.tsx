import { useMemo } from 'react'
import { css } from 'glamor'
import {
  useColorContext,
  Center,
  Editorial,
  inQuotes,
  slug,
  Breakout,
  fontStyles,
  ColorContextLocalExtension,
  ChevronRightIcon,
} from '@project-r/styleguide'
import QuestionScroll from './QuestionScroll'
import NextLink from 'next/link'
import ShareImage from '../../Article/ShareImage'
import { useRouter } from 'next/router'

const styles = {
  grid: css({
    display: 'flex',
    flexDirection: 'column',
    // gap: '1rem',
    marginBottom: 60,
  }),
  card: css({
    marginBottom: 10,
    padding: 10,
    maxWidth: '700px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px 10px 10px 3px',
    transition: '500ms filter',
    ':hover': {
      filter: 'brightness(85%)',
    },
  }),
  boldCitation: css({
    ...fontStyles.serifBold32,
  }),
}

const OVERVIEW_DATA = [
  {
    name: 'Claudia Kemfert',
    tagline:
      'Leiterin der Abteilung Energie, Verkehr, Umwelt beim Deutschen Institut für Wirtschaftsforschung',
    excerpt:
      'Die Uhr tickt. Es geht um nichts weniger, als die Erde ungefähr so zu erhalten, wie wir sie kennen.',
    color: 'color1',
  },
  {
    name: 'Patrick Hofstetter',
    tagline: 'Klimaschutzexperte des WWF Schweiz',
    excerpt:
      'Ich wünsche mir, dass alle verstehen, dass die Klimakrise real ist, dass unsere Warnungen auf Fakten beruhen und dass die heute nötigen Investitionen und Verhaltensänderungen viel kleiner sind als alles, was uns das Klimachaos aufzwingen wird.',
    color: 'color2',
  },
  {
    name: 'Sherry Rehman',
    tagline: 'Ministerin für Klimawandel von Pakistan',
    excerpt:
      'Es gibt kein Patentrezept zur Lösung der Klimakrise. Die Klimakrise ist ein vielschichtiges Problem, das einen ganzheitlichen Ansatz erfordert.',
    color: 'color4',
  },
  {
    name: 'Bernd Ulrich',
    tagline: 'Stellvertretender Chefredakteur, Die ZEIT',
    excerpt:
      'Ich würde mir wünschen, dass die Politiker:innen all ihr gewohntes und im letzten Jahrhundert erlerntes politisches Denken einmal durch die klimapolitische Relativitätstheorie schicken würden.',
    color: 'color5',
  },
  {
    name: 'Mitzi Jonelle Tan',
    tagline: '«Fridays for Future»-Aktivistin aus den Philippinen',
    excerpt:
      'Was den Klimawandel wirklich zur Krise werden lässt, ist die historische Ausbeutung von marginalisierten Gruppen, vor allem im Globalen Süden, vor allem durch den Globalen Norden.',
    color: 'color3',
  },
  {
    name: 'Rebecca Solnit',
    tagline: 'Schriftstellerin, Mitgründerin des Klimaprojekts Not too Late',
    excerpt:
      'Die aktuelle Klimarevolution könnte uns in allen Bereichen wohlhabender machen. ',
    color: 'color6',
  },
  {
    name: 'Reinhard Steurer',
    tagline:
      'assoz. Professor für Klimapolitik an der Universität für Bodenkultur in Wien',
    excerpt:
      'Ich wünschte, eine große Mehrheit würde verstehen, dass Klimaschutz kein „grünes Anliegen“ ist. Es geht um den Schutz von Leben und von unserer Zivilisation.',
    color: 'color7',
  },
  {
    name: 'Claudia Traidl-Hoffmann',
    tagline: 'Professorin für Umweltmedizin',
    excerpt:
      'Selbst wenn wir es als Weltgemeinschaft schaffen sollten, die Erderwärmung auf 1,5 Grad zu begrenzen, bedeutet das nicht, dass alles beim Alten bleiben wird.',
    color: 'color1',
  },
  {
    name: 'Kimberly Nicholas',
    tagline: 'Nachhaltigkeitswissenschaftlerin an der Universität Lund',
    excerpt: 'It’s warming. It’s us. We’re sure. It’s bad. We can fix it.',
    color: 'color2',
  },
]

const localColors = {
  dark: {
    color1: '#7BA7D2',
    color2: '#1189C7',
    color3: '#c6aa90',
    color4: '#f06a54',
    color5: '#b8b6bd',
    color6: '#96c5e4',
    color7: '#4CADAA',
  },
  light: {
    color1: '#3f7dba',
    color2: '#0c6695',
    color3: '#a87e57',
    color4: '#df3013',
    color5: '#888590',
    color6: '#4a9bd0',
    color7: '#38817f',
  },
}

export type Mdast = {
  identifier?: string
  type?: string
  meta?: object
  children?: Mdast[]
  value?: string
  url?: string
  [x: string]: unknown
}

export type ShareProps = {
  extract?: string
  title?: string
  description?: string
}

export type EdgeQuestionProps = {
  mdast?: Mdast[]
  share: ShareProps
  extract: boolean
}

export type Author = {
  name: string
  // currently, credentials supports links but no other formatting
  credentials: string
  profilePicture: string
}

export type QuestionAnswer = {
  content: Mdast
  author: Author
}

const groupNodes = (mdast: Mdast[]): Mdast[][] =>
  mdast.reduce((acc: Mdast[][], current: Mdast) => {
    if (!acc.length) return [[current]]
    const lastElement = acc[acc.length - 1]
    const lastIdentifier = lastElement[lastElement.length - 1].identifier
    // new bucket – infobox acts as separator
    if (lastIdentifier === 'INFOBOX') {
      return acc.concat([[current]])
    }
    return acc.map((el, idx, arr) =>
      idx === arr.length - 1 ? el.concat(current) : el,
    )
  }, [])

// the renderer expects a specific mdast structure...
const wrapContent = (mdast: Mdast[]): Mdast => ({
  type: 'root',
  meta: {
    template: 'article',
  },
  children: [{ identifier: 'CENTER', type: 'zone', children: mdast }],
})

const getText = (node: Mdast): string => {
  if (node.type === 'link')
    return `<a href="${node.url}">${getText(node.children[0])}</a>`
  if (node.type === 'text') return node.value
  return ''
}

const extractData = (mdast: Mdast[]): QuestionAnswer => {
  const infobox = mdast[mdast.length - 1]
  // if we have random crap at the end of the file we ignore it
  if (infobox.identifier !== 'INFOBOX') return

  return {
    content: wrapContent(mdast.slice(0, -1)),
    author: {
      name: infobox.children.find((child) => child.type === 'heading')
        .children[0].value,
      credentials: infobox.children
        .find((child) => child.type === 'paragraph')
        .children.map(getText)
        .join(''),
      profilePicture: infobox.children.find(
        (child) => child.identifier === 'FIGURE',
      )?.children[0].children[0].url,
    },
  }
}

const EdgeQuestion: React.FC<EdgeQuestionProps> = ({
  mdast,
  share,
  extract,
}) => {
  const router = useRouter()
  const { query } = router
  const answerId = query.share
  const answers: QuestionAnswer[] = useMemo(
    () => groupNodes(mdast).map(extractData).filter(Boolean),
    [mdast],
  )

  if (extract && query.extract) {
    const answer = answers.find((d) => slug(d.author.name) === answerId)
    return (
      <ShareImage
        meta={{
          shareText: `${answer.author.name}, was wünschten Sie, würden alle über die Klimakrise verstehen?`,
          shareInverted: true,
          shareFontSize: 64,
          format: {
            meta: {
              color: '#d732d4',
            },
          },
        }}
      />
    )
  }
  if (extract) {
    return null
  }
  return (
    <Center>
      <Breakout size='breakout'>
        <CardsOverview data={OVERVIEW_DATA} />
      </Breakout>
      <QuestionScroll answers={answers} share={share} />
    </Center>
  )
}

const CardsOverview: React.FC<{
  data: Array<{ name: string; excerpt: string; color: string; tagline: string }>
}> = ({ data }) => {
  return (
    <div {...styles.grid}>
      {data.map(({ name, excerpt, color, tagline }, idx) => {
        return (
          <div
            {...styles.card}
            key={idx}
            style={{
              alignSelf: idx % 3 === 0 ? 'flex-end' : 'flex-start',
              textAlign: idx % 3 === 0 ? 'right' : 'left',
            }}
          >
            <NextLink href={`#${slug(name)}`}>
              <a style={{ textDecoration: 'none' }}>
                <ColorContextLocalExtension localColors={localColors}>
                  <GetColorScheme>
                    {(colorScheme) => (
                      <>
                        <div>
                          <Editorial.Question
                            style={{ marginTop: 0 }}
                            {...styles.boldCitation}
                            {...colorScheme.set('color', color)}
                          >
                            {inQuotes(excerpt)}
                          </Editorial.Question>
                          <Editorial.Credit
                            style={{
                              marginTop: '0',
                              paddingTop: '20px',
                              textDecoration: 'underline',
                            }}
                            {...colorScheme.set('color', color)}
                          >
                            <span>{name}</span>
                            <span>
                              {', '}
                              {tagline}
                            </span>
                            <ChevronRightIcon />
                          </Editorial.Credit>
                        </div>
                      </>
                    )}
                  </GetColorScheme>
                </ColorContextLocalExtension>
              </a>
            </NextLink>
          </div>
        )
      })}
    </div>
  )
}

export default EdgeQuestion

const GetColorScheme = ({ children }) => {
  const [colorScheme] = useColorContext()

  return children(colorScheme)
}
