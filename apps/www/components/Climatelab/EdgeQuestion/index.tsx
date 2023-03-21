import { css } from 'glamor'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

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

import ShareImage from '../../Article/ShareImage'

import QuestionScroll from './QuestionScroll'
import { localColors, OVERVIEW_DATA } from './config'

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
        meta={{ shareText: `${answer.author.name} anwortet eine Frage.` }}
      />
    )
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
