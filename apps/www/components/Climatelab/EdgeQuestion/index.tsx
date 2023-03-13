import { css } from 'glamor'
import {
  useColorContext,
  Center,
  Editorial,
  inQuotes,
  slug,
  Breakout,
  fontStyles,
  ColorContextProvider,
  ColorContextLocalExtension,
} from '@project-r/styleguide'
import QuestionScroll from './QuestionScroll'
import NextLink from 'next/link'

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
    maxWidth: '600px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px 10px 10px 3px',
  }),
  boldCitation: css({
    ...fontStyles.serifBold32,
  }),
}

const OVERVIEW_DATA = [
  {
    name: 'Rebecca Solnit',
    tagline: 'Schriftstellerin',
    excerpt:
      'Die große Mehrheit der Menschen auf der Erde lebt ohnehin in Armut.',
    color: 'color1',
  },
  {
    name: 'Marcel Hänggi',
    tagline: 'Klimadude',
    excerpt: 'Ich wünschte mir mehr gesellschaftspolitische Vorstellungskraft.',
    color: 'color2',
  },
  {
    name: 'Rebecca Solnit',
    tagline: 'Schriftstellerin',
    excerpt:
      'Die große Mehrheit der Menschen auf der Erde lebt ohnehin in Armut.',
    color: 'color4',
  },
  {
    name: 'Marcel Hänggi',
    tagline: 'Klimadude',
    excerpt: 'Ich wünschte mir mehr gesellschaftspolitische Vorstellungskraft.',
    color: 'color5',
  },
  {
    name: 'Rebecca Solnit',
    tagline: 'Schriftstellerin',
    excerpt: 'Die große Mehrheit der Menschen',
    color: 'color3',
  },
  {
    name: 'Marcel Hänggi',
    tagline: 'Klimadude',
    excerpt: 'Gesellschaftspolitische Vorstellungskraft',
    color: 'color6',
  },
  {
    name: 'Marcel Hänggi',
    tagline: 'Klimadude',
    excerpt: 'Gesellschaftspolitische Vorstellungskraft',
    color: 'color7',
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

export type EdgeQuestionProps = { contentPath?: string; mdast?: Mdast[] }

const EdgeQuestion: React.FC<EdgeQuestionProps> = ({ contentPath, mdast }) => {
  return (
    <Center>
      <Breakout size='breakout'>
        <CardsOverview data={OVERVIEW_DATA} />
      </Breakout>
      <QuestionScroll contentPath={contentPath} mdast={mdast} />
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
                            }}
                            {...colorScheme.set('color', color)}
                          >
                            <span>{name}</span>
                            <span>
                              {', '}
                              {tagline}
                            </span>
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
