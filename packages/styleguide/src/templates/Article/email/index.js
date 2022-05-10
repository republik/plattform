import { matchType } from 'mdast-react-render/lib/utils'
import Container from '../../EditorialNewsletter/email/Container'
import { editorialParagraphRule } from '../../shared/email/rules/paragraphRule'
import centerRule from '../../shared/email/rules/centerRule'
import {
  coverRule,
  edgeToEdgeFigureRule,
} from '../../shared/email/rules/figureRule'
import titleBlockRule from '../../shared/email/rules/titleBlockRule'

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
            hasAccess: 'Customer:Member,Geteilter Zugriff',
          },
          _mergeTags: true,
        },
      }),
      rules: [
        editorialParagraphRule,
        titleBlockRule,
        centerRule,
        coverRule,
        edgeToEdgeFigureRule,
      ],
    },
  ],
}

export default articleEmailSchema
