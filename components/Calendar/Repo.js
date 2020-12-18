import React, { useMemo, useState } from 'react'
import { css } from 'glamor'
import { Link } from '../../lib/routes'
import { fontStyles, useColorContext, inQuotes } from '@project-r/styleguide'
import { getLabel, getTitle } from '../Repo/utils'
import { Phase } from '../Repo/Phases'
import EditMetaDate from '../Repo/EditMetaDate'
import { graphql } from 'react-apollo'
import { GITHUB_ORG } from '../../lib/settings'
import gql from 'graphql-tag'

const styles = {
  container: css({
    cursor: 'pointer',
    maxWidth: 200,
    borderWidth: 1,
    borderStyle: 'solid',
    margin: 10,
    padding: 5,
    transition: 'all 0.5s'
  }),
  title: css({
    textDecoration: 'underline',
    padding: '5px 0'
  }),
  label: css({
    marginBottom: 10,
    ...fontStyles.sansSerifMedium14
  }),
  status: css({
    marginTop: 10
  }),
  editDate: css({
    ...fontStyles.sansSerifRegular14,
    marginBottom: 10
  }),
  commitMsg: css({
    ...fontStyles.sansSerifRegular14
  })
}

// TODO: extra shared fragment for repo data (cf. index.js)
const getPlaceholder = gql`
  query getPlaceholder($repoId: ID!) {
    repo(id: $repoId) {
      id
      meta {
        publishDate
      }
      latestCommit {
        id
        date
        message
        author {
          name
        }
        document {
          id
          meta {
            template
            title
            series {
              title
            }
            section {
              id
              meta {
                title
              }
            }
            format {
              id
              meta {
                title
              }
            }
            dossier {
              id
              meta {
                title
              }
            }
          }
        }
      }
    }
  }
`

export const Placeholder = graphql(getPlaceholder, {
  options: ({ placeholder }) => ({
    variables: {
      repoId: `${GITHUB_ORG}/${placeholder.repoId}`
    }
  })
})(({ placeholder, data, data: { repo }, ...props }) => {
  return repo ? <Repo repo={repo} {...props} isPlaceholder /> : null
})

const CommitMsg = ({ msg }) => (
  <span {...styles.commitMsg}>{inQuotes(msg)}</span>
)

const Repo = ({ repo, isNewsletter, isPast, isPlaceholder }) => {
  const [colorScheme] = useColorContext()
  const [editing, setEditing] = useState(false)

  const {
    id,
    currentPhase,
    meta: { publishDate }
  } = repo
  const colorStyles = useMemo(
    () =>
      css({
        borderColor: colorScheme.getCSSColor('divider'),
        color: editing && colorScheme.getCSSColor('text'),
        backgroundColor: colorScheme.getCSSColor(
          isNewsletter ? 'hover' : 'default'
        ),
        '@media (hover)': {
          ':hover': {
            borderColor: colorScheme.getCSSColor('hover')
          }
        }
      }),
    [colorScheme, isNewsletter, editing]
  )
  const label = getLabel(repo)

  // TODO: correct URL + set publication date for placeholders

  return (
    <Link route='repo/tree' params={{ repoId: id.split('/') }} passHref>
      <div {...styles.container} {...colorStyles}>
        {label && <div {...styles.label}>{label}</div>}
        <div {...styles.title}>{getTitle(repo)}</div>
        {!isPlaceholder && (
          <div {...styles.status}>
            {isNewsletter ? (
              <CommitMsg msg={repo.latestCommit.message} />
            ) : (
              <>
                <div
                  onClick={e => e.preventDefault()}
                  {...styles.editDate}
                  {...colorScheme.set('color', 'textSoft')}
                >
                  <EditMetaDate
                    publishDate={publishDate}
                    repoId={id}
                    propagateEditing={setEditing}
                  />
                </div>
                <Phase phase={currentPhase} discrete={isPast} />
              </>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export default Repo
