import { MdLock as LockIcon, MdPublic as PublicIcon } from 'react-icons/md'

import { A, Label, colors } from '@project-r/styleguide'

import { Link } from '../../lib/routes'
import { intersperse } from '../../lib/utils/helpers'
import { FRONTEND_BASE_URL } from '../../lib/settings'

import { Tr, Td, TdNum } from '../Table'

import EditMetaDate from './EditMetaDate'
import { Phase } from './Phases'
import {
  getLabel,
  getTitle,
  isPrepublished,
  isPublished,
} from '../../lib/utils/repo'
import { displayDateTime } from '../../lib/utils/calendar'

const PublicationLink =
  (Icon) =>
  ({
    name,
    document: {
      meta: { path, format },
    },
  }) =>
    (
      <a
        key={name}
        href={`${format?.meta.externalBaseUrl || FRONTEND_BASE_URL}${path}`}
      >
        <Icon color={colors.primary} />
      </a>
    )

const RepoRow = ({ repo, showPhases }) => {
  const {
    id,
    meta: { publishDate },
    latestCommit: {
      date,
      author: { name: authorName },
      message,
      document: { meta },
    },
    currentPhase,
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
        <Link route='repo/tree' params={{ repoId: id.split('/') }} passHref>
          <A title={id}>{getTitle(repo)}</A>
        </Link>
      </Td>
      <Td>
        {intersperse(
          meta.contributors
            .filter(({ kind }) => kind?.includes('Text'))
            .map(({ name, user }, i) => {
              if (user?.username) {
                return (
                  <A
                    key={user.id}
                    href={`${FRONTEND_BASE_URL}/~${user.username}`}
                    target='_blank'
                  >
                    {name}
                  </A>
                )
              }
              return <span key={i}>{name}</span>
            }),
          () => ', ',
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
        <EditMetaDate publishDate={publishDate} repoId={id} />
      </TdNum>
      <Td>{showPhases && <Phase phase={currentPhase} />}</Td>
      <Td style={{ textAlign: 'right' }}>
        {repo.latestPublications
          .filter(isPrepublished)
          .map(PublicationLink(LockIcon))}{' '}
        {repo.latestPublications
          .filter(isPublished)
          .map(PublicationLink(PublicIcon))}{' '}
      </Td>
    </Tr>
  )
}

export default RepoRow
