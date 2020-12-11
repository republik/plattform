import React from 'react'
import { css } from 'glamor'
import { Label, linkRule, useColorContext } from '@project-r/styleguide'
import { getLabel, getTitle } from '../Repo/utils'
import { Link } from '../../lib/routes'
import { Phase } from '../Repo/Phases'

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

const mockRepo = {
  id: 'republik-dev/article-master-of-the-universe',
  meta: {
    publishDate: '2020-04-08T10:32:30.254Z',
    __typename: 'RepoMeta'
  },
  latestCommit: {
    id: '93db7494c8635b7fcbbe353a2e5b4008354540a5',
    date: '2020-04-23T15:34:23.000Z',
    message: 'fixed bug?',
    author: {
      name: 'Anna Traussnig',
      __typename: 'Author'
    },
    document: {
      id:
        'cmVwbzpyZXB1Ymxpay1kZXYvYXJ0aWNsZS1tYXN0ZXItb2YtdGhlLXVuaXZlcnNlOjkzZGI3NDk0Yzg2MzViN2ZjYmJlMzUzYTJlNWI0MDA4MzU0NTQwYTU=',
      meta: {
        template: 'article',
        title: 'Masters of the Universe',
        credits: [
          {
            type: 'text',
            value: 'Von '
          },
          {
            type: 'link',
            title: null,
            url: '/~ca9c46ca-a21b-4f6e-aad3-1010acd419d5',
            children: [
              {
                type: 'text',
                value: 'Anna Traussnig'
              }
            ]
          },
          {
            type: 'text',
            value: ', 08.04.2020'
          }
        ],
        series: {
          title: 'SciFi',
          __typename: 'Series'
        },
        section: null,
        format: null,
        dossier: null,
        __typename: 'Meta'
      },
      __typename: 'Document'
    },
    __typename: 'Commit'
  },
  latestPublications: [
    {
      name: 'v11',
      prepublication: false,
      live: true,
      scheduledAt: null,
      document: {
        id:
          'cmVwdWJsaWstZGV2L2FydGljbGUtbWFzdGVyLW9mLXRoZS11bml2ZXJzZS80MmEwZDBjZTQ3MzM1ZWJmNTQwZmIwYWFhMjExZWRlYTI0ZGUyODllL3YxMQ==',
        meta: {
          path: '/2020/04/08/masters-of-the-universe',
          slug: 'masters-of-the-universe',
          __typename: 'Meta'
        },
        __typename: 'Document'
      },
      __typename: 'Publication'
    }
  ],
  currentPhase: {
    key: 'published',
    color: 'RoyalBlue',
    label: 'Publiziert',
    __typename: 'RepoPhase'
  },
  __typename: 'Repo'
}

const styles = {
  calendar: css({
    display: 'flex',
    minHeight: 500
  }),
  weekday: css({
    flex: 1,
    borderLeftWidth: 1,
    borderLeftStyle: 'solid'
  }),
  repo: css({
    borderWidth: 1,
    borderStyle: 'solid',
    margin: 10,
    padding: 5
  }),
  label: css({
    marginBottom: 15
  }),
  phase: css({
    marginTop: 10
  })
}

const Repo = () => {
  const [colorScheme] = useColorContext()
  const { id, currentPhase } = mockRepo
  const label = getLabel(mockRepo)
  return (
    <div {...styles.repo} {...colorScheme.set('borderColor', 'divider')}>
      {label && (
        <div {...styles.label}>
          <Label>{label}</Label>
        </div>
      )}
      <Link route='repo/tree' params={{ repoId: id.split('/') }}>
        <a {...linkRule} title={id}>
          {getTitle(mockRepo)}
        </a>
      </Link>
      <div {...styles.phase}>
        <Phase phase={currentPhase} />
      </div>
    </div>
  )
}

const WeekDay = ({ weekday }) => {
  const [colorScheme] = useColorContext()

  return (
    <div {...styles.weekday} {...colorScheme.set('borderLeftColor', 'divider')}>
      <strong style={{ paddingLeft: 5 }}>{weekday}</strong>
      <Repo />
      <Repo />
      <Repo />
    </div>
  )
}

const Calendar = () => (
  <div {...styles.calendar}>
    {DAYS.map(day => (
      <WeekDay key={day} weekday={day} />
    ))}
  </div>
)

export default Calendar
