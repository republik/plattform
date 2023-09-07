import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'
import withT from '../lib/withT'

import Frame from '../components/Frame'

import {
  CommentBodyBlockQuote,
  CommentBodyBlockQuoteParagraph,
  CommentBodyCode,
  CommentBodyHeading,
  CommentBodyList,
  CommentBodyListItem,
  CommentBodyParagraph,
  Editorial,
  Interaction,
  HR,
  mediaQueries,
} from '@project-r/styleguide'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'
import { withDefaultSSR } from '../lib/apollo/helpers'

const { P, A, Emphasis, Cursive, StrikeThrough } = Editorial

const styles = {
  table: css({
    width: '100%',
    '& th': {
      borderBottom: `1px solid ${'var(--color-divider)'}`,
      padding: '0 40px 20px 0',
      textAlign: 'left',
    },
    '& td': {
      padding: '20px 10px 0 0',
      [mediaQueries.mUp]: {
        paddingRight: 40,
      },
    },
  }),
}

const Page = ({ router, t }) => {
  const meta = {
    pageTitle: t('markdown/pageTitle'),
    title: t('markdown/title'),
    description: t('markdown/description'),
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/markdown.png`,
    url: `${PUBLIC_BASE_URL}${router.pathname}`,
  }

  return (
    <Frame meta={meta}>
      <Interaction.H1>Markdown</Interaction.H1>
      <P>
        Sie wollen in einer Debatte eine Quelle verlinken oder einen Begriff
        hervorheben? Das können Sie ganz einfach mit Markdown. Hier die
        wichtigsten Tricks im Überblick:
      </P>
      <table {...styles.table}>
        <tbody>
          <tr>
            <th>Markdown</th>
            <th>Ergebnis</th>
          </tr>
          <tr>
            <td>**fett**</td>
            <td>
              <Emphasis>fett</Emphasis>
            </td>
          </tr>
          <tr>
            <td>*kursiv*</td>
            <td>
              <Cursive>kursiv</Cursive>
            </td>
          </tr>
          <tr>
            <td colSpan='2'>
              Benutzen Sie ein Backslash vor dem Gendersternchen damit es nicht
              mit kursiv verwechselt wird:
            </td>
          </tr>
          <tr>
            <td style={{ paddingTop: 10 }}>Leser\*in</td>
            <td style={{ paddingTop: 10 }}>Leser*in</td>
          </tr>
          <tr>
            <td>~~durchgestrichen~~</td>
            <td>
              <CommentBodyParagraph>
                <StrikeThrough>durchgestrichen</StrikeThrough>
              </CommentBodyParagraph>
            </td>
          </tr>
          <tr>
            <td>Ein [Link](https://republik.ch)</td>
            <td>
              <CommentBodyParagraph>
                Ein <A href='https://www.republik.ch'>Link</A>
              </CommentBodyParagraph>
            </td>
          </tr>
          <tr>
            <td># Eine Überschrift</td>
            <td>
              <CommentBodyHeading>Eine Überschrift</CommentBodyHeading>
            </td>
          </tr>
          <tr>
            <td>&gt; Ein Zitat</td>
            <td>
              <CommentBodyBlockQuote>
                <CommentBodyBlockQuoteParagraph>
                  Ein Zitat
                </CommentBodyBlockQuoteParagraph>
              </CommentBodyBlockQuote>
            </td>
          </tr>
          <tr>
            <td colSpan='2'>
              Eckige Klammern benötigen, wie das Gendersternchen, einen
              Backslash. Zum Beispiel bei Anmerkungen in einem Zitat:
            </td>
          </tr>
          <tr>
            <td style={{ paddingTop: 0 }}>&gt; Himmelspolizey \[sic\]</td>
            <td style={{ paddingTop: 0 }}>
              <CommentBodyBlockQuote>
                <CommentBodyBlockQuoteParagraph>
                  Himmelspolizey [sic]
                </CommentBodyBlockQuoteParagraph>
              </CommentBodyBlockQuote>
            </td>
          </tr>
          <tr>
            <td>Ein `CodeBeispiel()` im Text</td>
            <td>
              <CommentBodyParagraph>
                Ein <CommentBodyCode>CodeBeispiel()</CommentBodyCode> im Text
              </CommentBodyParagraph>
            </td>
          </tr>
          <tr>
            <td>***</td>
            <td>
              <HR />
            </td>
          </tr>
          <tr>
            <td>
              * Liste
              <br />
              * Liste
              <br />
              * Liste
              <br />
            </td>
            <td>
              <CommentBodyList data={{ ordered: false }}>
                <CommentBodyListItem>Liste</CommentBodyListItem>
                <CommentBodyListItem>Liste</CommentBodyListItem>
                <CommentBodyListItem>Liste</CommentBodyListItem>
              </CommentBodyList>
            </td>
          </tr>
          <tr>
            <td>
              1. Liste
              <br />
              2. Liste
              <br />
              3. Liste
              <br />
            </td>
            <td>
              <CommentBodyList data={{ ordered: true }}>
                <CommentBodyListItem>Liste</CommentBodyListItem>
                <CommentBodyListItem>Liste</CommentBodyListItem>
                <CommentBodyListItem>Liste</CommentBodyListItem>
              </CommentBodyList>
            </td>
          </tr>
        </tbody>
      </table>
    </Frame>
  )
}

export default withDefaultSSR(compose(withT, withRouter)(Page))
