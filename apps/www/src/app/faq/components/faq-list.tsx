import { nest } from 'd3-collection'
import FAQEntry from './faq-entry'
import {
  FaqEntryRecord,
  FaqQuery,
} from '#graphql/cms/__generated__/gql/graphql'
import { css } from '@republik/theme/css'
import { StructuredText } from 'react-datocms/structured-text'

type FAQListProps = {
  entries: FaqQuery['faq']['entries']
  title: FaqQuery['faq']['title']
  introduction: FaqQuery['faq']['introduction']
}

export default function FAQList({
  entries,
  title,
  introduction,
}: FAQListProps) {
  const entriesByCategory: [{ key: string; values: FaqEntryRecord[] }] = nest()
    .key((d) => d.category)
    .entries(entries)

  return (
    <>
      <h1 className={css({ textStyle: 'h1Sans', marginY: '8-16' })}>{title}</h1>
      <p className={css({ textStyle: 'sans' })}>
        <StructuredText data={introduction.value} />{' '}
      </p>
      {entriesByCategory.map(({ key: categoryTitle, values: entries }) => (
        <div key={categoryTitle}>
          <h2 className={css({ textStyle: 'h2Sans', marginY: '4-8' })}>
            {categoryTitle}
          </h2>
          {entries.map((entry) => (
            <FAQEntry key={entry.question} entry={entry} />
          ))}
        </div>
      ))}
    </>
  )
}
