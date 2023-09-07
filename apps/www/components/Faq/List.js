import { Component } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css, merge } from 'glamor'

import Loader from '../Loader'

import {
  Interaction,
  RawHtml,
  fontFamilies,
  mediaQueries,
} from '@project-r/styleguide'

import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from '../constants'

import { nest } from 'd3-collection'

const { P } = Interaction

const styles = {
  category: css({
    marginBottom: 40,
  }),
  title: css({
    marginBottom: 20,
  }),
  faq: css({
    padding: '10px 0',
    borderBottom: `1px solid ${'var(--color-divider)'}`,
  }),
  faqAnchor: css({
    display: 'block',
    visibility: 'hidden',
    position: 'relative',
    top: -(HEADER_HEIGHT_MOBILE + 5),
    [mediaQueries.mUp]: {
      top: -(HEADER_HEIGHT + 5),
    },
  }),
  question: css({
    cursor: 'pointer',
    '& a': {
      color: 'inherit',
      textDecoration: 'none',
    },
  }),
  answer: css({
    paddingBottom: 10,
    margin: '20px 0 40px 0',
  }),
  active: css({
    fontFamily: fontFamilies.sansSerifMedium,
    marginBottom: 10,
  }),
}

export const H2 = ({ children }) => (
  <Interaction.H2 {...styles.title}>{children}</Interaction.H2>
)

const AnswerP = (args) => <P {...args} {...styles.answer} />

const slug = (string) =>
  string
    .toLowerCase()
    .replace(/[^0-9a-zäöü]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-')

export class RawList extends Component {
  constructor(...args) {
    super(...args)

    this.state = {}

    this.renderFaq = (faq, i) => {
      const active = this.state[slug(faq.question)]
      return (
        <div key={i} {...styles.faq}>
          <a {...styles.faqAnchor} id={slug(faq.question)} />
          <P {...merge(styles.question, active && styles.active)}>
            <a
              href={`#${slug(faq.question)}`}
              onClick={(e) => {
                e.preventDefault()
                this.setState(() => ({
                  [slug(faq.question)]: !active,
                }))
              }}
            >
              {faq.question}
            </a>
          </P>
          {active && (
            <RawHtml
              type={AnswerP}
              key={`answer${i}`}
              dangerouslySetInnerHTML={{
                __html: faq.answer.split('\n').join('<br />'),
              }}
            />
          )}
        </div>
      )
    }
  }
  componentDidMount() {
    if (window.location.hash) {
      this.setState(() => ({
        [window.location.hash.replace(/^#/, '')]: true,
      }))
    }
  }
  render() {
    const {
      data: { loading, error, faqs },
      flat,
    } = this.props
    return (
      <Loader
        loading={loading}
        error={error}
        render={() => {
          if (flat) {
            return <div>{faqs.map(this.renderFaq)}</div>
          }

          const faqsByCategory = nest()
            .key((d) => d.category)
            .entries(faqs)

          return (
            <div>
              {faqsByCategory.map(({ key: title, values }) => (
                <div {...styles.category} key={title}>
                  <H2>{title}</H2>
                  {values.map(this.renderFaq)}
                </div>
              ))}
            </div>
          )
        }}
      />
    )
  }
}

const publishedFaqs = gql`
  query FaqList {
    faqs {
      category
      question
      answer
    }
  }
`

export default compose(graphql(publishedFaqs))(RawList)
