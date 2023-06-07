import { matchParagraph, matchZone } from '@republik/mdast-react-render'
import { Note, NoteParagraph } from '../components/Note'
import inlineRules from './inlineRules'
import { linkRule } from './linkRule'

const noteRule = {
  matchMdast: matchZone('NOTE'),
  component: Note,
  rules: [
    {
      matchMdast: matchParagraph,
      component: NoteParagraph,
      rules: [inlineRules, linkRule],
    },
  ],
}

export default noteRule
