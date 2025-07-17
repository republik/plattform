import { FaqEntryRecord } from '#graphql/cms/__generated__/gql/graphql'
import { StructuredText } from 'react-datocms/structured-text'
import { css } from '@republik/theme/css'

type FAQEntryProps = {
  entry: FaqEntryRecord
}

const styles = {
  entry: css({
    paddingY: '3',
    borderColor: 'divider',
    borderBottomWidth: 1,
  }),
  question: css({
    fontSize: 'xl',
  }),
  answer: css({
    padding: '6',
    color: 'contrast',
    '&>*:not(:first-child)': {
      marginTop: '3',
    },
    '& ul > li': {
      listStyleType: 'none',
      pl: '6',
      position: 'relative',
      '&:not(:first-child)': {
        marginTop: '1',
      },
      '&::before': { content: '"–"', position: 'absolute', left: '0' },
    },
    '& ol': { listStyleType: 'decimal', paddingLeft: '6', marginLeft: '2' },
    '& ol > li': {
      '&:not(:first-child)': {
        marginTop: '1',
      },
    },
    '& h2, & h3, & h4, & h5, & h6': {
      fontWeight: 'bold',
    },
  }),
}

export default function FAQEntry({ entry }: FAQEntryProps) {
  const anchorString = entry.question
    .toLowerCase()
    .replace(/[^0-9a-zäöü]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-')

  return (
    <details className={styles.entry} key={anchorString}>
      <summary id={anchorString} className={styles.question}>
        {entry.question}
      </summary>
      <p className={styles.answer}>
        <StructuredText data={entry.answer.value} />
      </p>
    </details>
  )
}
