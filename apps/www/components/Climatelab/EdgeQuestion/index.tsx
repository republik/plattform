import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { Center, slug, Breakout } from '@project-r/styleguide'

import ShareImage from '../../Article/ShareImage'

import CardsOverview from './Cards'
import QuestionScroll from './QuestionScroll'

import { localColors } from './config'

export type Mdast = {
  identifier?: string
  type?: string
  meta?: object
  children?: Mdast[]
  value?: string
  url?: string
  [x: string]: unknown
}

export type CardProps = {
  name: string
  tagline: string
  excerpt: string
  color: string
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
  overviewData?: CardProps[]
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
  if (node.type === 'emphasis') return `<em>${getText(node.children[0])}</em>`
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
  overviewData,
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
    const personColorIndex =
      answer.author.name.length % Object.keys(localColors.light).length

    return (
      <ShareImage
        meta={{
          shareText: `${answer.author.name}, was wünschten Sie, würden alle über die Klimakrise verstehen?`,
          shareInverted: true,
          shareFontSize: 64,
          format: {
            meta: {
              color: localColors.light[`color${personColorIndex}`],
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
        <CardsOverview overviewData={overviewData} />
      </Breakout>
      <QuestionScroll answers={answers} share={share} />
    </Center>
  )
}

export default EdgeQuestion
