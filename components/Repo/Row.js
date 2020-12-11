import React from 'react'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'

import GithubIcon from 'react-icons/lib/fa/github'
import LockIcon from 'react-icons/lib/md/lock'
import PublicIcon from 'react-icons/lib/md/public'
import { renderMdast } from 'mdast-react-render'
import { matchType } from 'mdast-react-render/lib/utils'

import { linkRule, A, Label, colors } from '@project-r/styleguide'

import { Link } from '../../lib/routes'
import { intersperse } from '../../lib/utils/helpers'
import { FRONTEND_BASE_URL } from '../../lib/settings'

import { Tr, Td, TdNum } from '../Table'

import EditMetaDate from './EditMetaDate'
import { Phase } from './Phases'
import {
  displayDateTime,
  getLabel,
  getTitle,
  isPrepublished,
  isPublished
} from './utils'

const editRepoMeta = gql`
  mutation editRepoMeta($repoId: ID!, $publishDate: DateTime) {
    editRepoMeta(repoId: $repoId, publishDate: $publishDate) {
      id
      meta {
        publishDate
      }
    }
  }
`

const link = {
  matchMdast: matchType('link'),
  props: node => ({
    title: node.title,
    href: node.url
  }),
  component: A
}
const creditSchema = {
  rules: [link]
}

const PublicationLink = Icon => ({
  name,
  document: {
    meta: { path, slug }
  }
}) => (
  <a key={name} href={`${FRONTEND_BASE_URL}${path || '/' + slug}`}>
    <Icon color={colors.primary} />
  </a>
)

const RepoRow = compose(
  graphql(editRepoMeta, {
    props: ({ mutate }) => ({
      editRepoMeta: variables => mutate({ variables })
    })
  })
)(({ repo, showPhases }) => {
  console.log(repo)
  const {
    id,
    meta: { publishDate },
    latestCommit: {
      date,
      author: { name: authorName },
      message,
      document: { meta }
    },
    currentPhase
  } = repo
  const label = getLabel(repo)
  return (
    <Tr key={id}>
      <Td>
        {label && (
          <>
            <Label>{label}</Label>
            <br />
          </>
        )}
        <Link route='repo/tree' params={{ repoId: id.split('/') }}>
          <a {...linkRule} title={id}>
            {getTitle(repo)}
          </a>
        </Link>
      </Td>
      <Td>
        {meta.credits &&
          intersperse(
            renderMdast(meta.credits.filter(link.matchMdast), creditSchema),
            () => ', '
          )}
      </Td>
      <TdNum>
        {displayDateTime(date)}
        <br />
        <Label>
          {authorName}: «{message}»
        </Label>
      </TdNum>
      <TdNum>
        <EditMetaDate
          value={publishDate}
          onChange={value => editRepoMeta({ repoId: id, publishDate: value })}
        />
      </TdNum>
      <Td>{showPhases && <Phase phase={currentPhase} />}</Td>
      <Td style={{ textAlign: 'right' }}>
        {repo.latestPublications
          .filter(isPrepublished)
          .map(PublicationLink(LockIcon))}{' '}
        {repo.latestPublications
          .filter(isPublished)
          .map(PublicationLink(PublicIcon))}{' '}
        <a href={`https://github.com/${id}`}>
          <GithubIcon color={colors.primary} />
        </a>
      </Td>
    </Tr>
  )
})

export default RepoRow
