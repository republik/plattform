import { css } from 'glamor'
import { useColorContext } from '@project-r/styleguide'
import { useEffect, useState } from 'react'
import QuestionScroll from './QuestionScroll'

const styles = {}

const OVERVIEW_DATA = [
  {
    name: 'Rebecca Solnit',
    excerpt:
      'Die große Mehrheit der Menschen auf der Erde lebt ohnehin in Armut.',
  },
  {
    name: 'Marcel Hänggi',
    excerpt: 'Ich wünschte mir mehr gesellschaftspolitische Vorstellungskraft.',
  },
]

type EdgeQuestionProps = { contentPath: string }

const EdgeQuestion: React.FC<EdgeQuestionProps> = ({ contentPath }) => {
  return (
    <div>
      {OVERVIEW_DATA.map(({ name, excerpt }, idx) => {
        return <div key={idx}>{excerpt}</div>
      })}
      <QuestionScroll contentPath={contentPath} />
    </div>
  )
}

export default EdgeQuestion
