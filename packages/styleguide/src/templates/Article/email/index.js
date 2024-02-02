import { matchType } from '@republik/mdast-react-render'
import Container from '../../shared/email/components/Container'
import { editorialParagraphRule } from '../../shared/email/rules/paragraphRule'
import centerRule from '../../shared/email/rules/centerRule'
import {
  coverRule,
  edgeToEdgeFigureRule,
} from '../../shared/email/rules/figureRule'

const articleEmailSchema = {
  rules: [
    {
      matchMdast: matchType('root'),
      component: Container,
      props: (node) => ({
        meta: node.meta || {},
        variableContext: {
          firstName: 'FNAME',
          lastName: 'LNAME',
          groups: {
            hasAccess: 'Customer:Member',
          },
          _mergeTags: true,
        },
      }),
      rules: [
        editorialParagraphRule,
        // we do not render the title block
        // titleBlockRule,
        centerRule,
        // we do not render the cover
        // we cannot just ignore this rule, otherwise, regular figure rule kicks in
        {
          ...coverRule,
          component: () => null,
        },
        edgeToEdgeFigureRule,
      ],
    },
  ],
}

export default articleEmailSchema
