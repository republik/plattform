import {
  matchHeading,
  matchParagraph,
  matchType,
  matchZone,
} from '@republik/mdast-react-render'
import HR from '../shared/components/HR'
import authorRule from '../shared/rules/authorRule'
import datawrapperRule from '../shared/rules/datawrapperRule'
import elseRule from '../shared/rules/elseRule'
import emailOnlyRule from '../shared/rules/emailOnlyRule'
import ifRule from '../shared/rules/ifRule'
import webOnlyRule from '../shared/rules/webOnlyRule'

import {
  extractImages,
  getDatePath,
  matchFigure,
  matchImagesParagraph,
  matchSpanType,
} from '../shared/util/matchers'

import { getResizedSrcs } from '../styleguide-clone/components/Figure/utils'
import { Variable } from '../styleguide-clone/components/Variables'
import Blockquote, {
  BlockquoteSource,
  BlockquoteText,
} from './components/Blockquote'
import { Br } from './components/Paragraph'

const matchLast = (node, index, parent) => index === parent.children.length - 1

const createNewsletterSchema = ({
  H2,
  Paragraph,
  Container,
  Cover,
  CoverImage,
  Center,
  Figure,
  Image,
  Caption,
  Byline,
  Sub,
  Sup,
  Memo = ({ children }) => <>{children}</>,
  Button,
  List,
  ListItem,
  ListP,
  variableContext,
  A,
} = {}) => {
  const matchSpan = matchType('span')
  const globalInlines = [
    {
      matchMdast: matchType('break'),
      component: Br,
    },
    {
      matchMdast: matchType('sub'),
      component: Sub,
    },
    {
      matchMdast: matchType('sup'),
      component: Sup,
    },
    {
      matchMdast: matchSpanType('MEMO'),
      component: Memo,
    },
    {
      matchMdast: (node) => matchSpan(node) && node.data?.variable,
      props: (node) => node.data,
      component: Variable,
    },
  ]

  const link = {
    matchMdast: matchType('link'),
    component: A,
    props: (node) => ({
      title: node.title,
      href: node.url,
    }),
  }

  const createParagraphRule = (customComponent) => {
    return {
      matchMdast: matchParagraph,
      component: customComponent || Paragraph,
      rules: [
        ...globalInlines,
        link,
        {
          matchMdast: matchType('strong'),
          component: ({ attributes, children }) => (
            <strong {...attributes}>{children}</strong>
          ),
        },
        {
          matchMdast: matchType('emphasis'),
          component: ({ attributes, children }) => (
            <em {...attributes}>{children}</em>
          ),
        },
      ],
    }
  }

  const paragraph = createParagraphRule()
  const listParagraph = createParagraphRule(ListP)

  const figureCaption = {
    matchMdast: matchParagraph,
    component: Caption,
    rules: [
      {
        matchMdast: matchType('emphasis'),
        component: Byline,
      },
      link,
      ...globalInlines,
    ],
  }

  const figure = {
    matchMdast: matchFigure,
    component: Figure,
    props: (node) => {
      return node.data
    },
    rules: [
      {
        matchMdast: matchImagesParagraph,
        component: Image,
        props: (node, index, parent) => {
          const { src, srcDark } = extractImages(node)
          const displayWidth = 600
          const { plain } = parent.data

          return {
            ...getResizedSrcs(src, srcDark, displayWidth),
            alt: node.children[0].alt,
            plain,
          }
        },
      },
      figureCaption,
    ],
  }

  const cover = {
    matchMdast: (node, index) => {
      return matchFigure(node) && index === 0
    },
    component: Cover,
    rules: [
      {
        matchMdast: matchImagesParagraph,
        component: CoverImage,
        props: (node, index, parent) => {
          const { src, srcDark } = extractImages(node)
          const displayWidth = 1280
          const setMaxWidth = parent.data.size !== undefined

          return {
            ...getResizedSrcs(src, srcDark, displayWidth, setMaxWidth),
            alt: node.children[0].alt,
          }
        },
      },
      figureCaption,
    ],
  }

  return {
    emailTemplate: 'newsletter-editorial',
    repoPrefix: 'newsletter-editorial-',
    getPath: getDatePath,
    rules: [
      {
        matchMdast: matchType('root'),
        component: Container,
        props: (node) => ({
          meta: node.meta || {},
          variableContext,
        }),
        rules: [
          {
            matchMdast: () => false,
          },
          cover,
          {
            matchMdast: matchZone('CENTER'),
            component: Center,
            rules: [
              paragraph,
              figure,
              datawrapperRule,
              webOnlyRule,
              emailOnlyRule,
              {
                matchMdast: matchHeading(2),
                component: H2,
              },
              ifRule,
              elseRule,
              authorRule,
              {
                matchMdast: matchZone('BUTTON'),
                component: Button,
                props: (node) => {
                  const link =
                    (node.children[0] && node.children[0].children[0]) || {}

                  return {
                    ...node.data,
                    title: link.title,
                    href: link.url,
                  }
                },
                rules: globalInlines.concat({
                  matchMdast: matchParagraph,
                  component: ({ children }) => children,
                  rules: [
                    {
                      matchMdast: matchType('link'),
                      component: ({ children }) => children,
                      rules: globalInlines,
                    },
                  ],
                }),
              },
              {
                matchMdast: matchZone('QUOTE'),
                component: Blockquote,
                rules: [
                  {
                    matchMdast: (node, index, parent) =>
                      matchParagraph(node) &&
                      (index === 0 || !matchLast(node, index, parent)),
                    component: BlockquoteText,
                    rules: [paragraph],
                  },
                  {
                    matchMdast: (node, index, parent) =>
                      matchParagraph(node) && matchLast(node, index, parent),
                    component: BlockquoteSource,
                    rules: [paragraph],
                  },
                ],
              },
              {
                matchMdast: matchType('list'),
                component: List,
                props: (node) => ({
                  data: {
                    ordered: node.ordered,
                    start: node.start,
                  },
                }),
                rules: [
                  {
                    matchMdast: matchType('listItem'),
                    component: ListItem,
                    rules: [listParagraph],
                  },
                ],
              },
              {
                matchMdast: matchType('thematicBreak'),
                component: HR,
              },
            ],
          },
          {
            matchMdast: () => false,
          },
        ],
      },
    ],
  }
}

export default createNewsletterSchema
