import React from 'react'
import { css } from 'glamor'
import { Link } from '../../lib/routes'
import { Label, useColorContext } from '@project-r/styleguide'
import { getLabel, getTitle } from '../Repo/utils'
import { Phase } from '../Repo/Phases'

const styles = {
  container: css({
    cursor: 'pointer',
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

const Repo = ({ repo }) => {
  const [colorScheme] = useColorContext()
  const { id, currentPhase } = repo
  const label = getLabel(repo)
  return (
    <Link route='repo/tree' params={{ repoId: id.split('/') }} passHref>
      <div {...styles.container} {...colorScheme.set('borderColor', 'divider')}>
        {label && (
          <div {...styles.label}>
            <Label>{label}</Label>
          </div>
        )}
        {getTitle(repo)}
        <div {...styles.phase}>
          <Phase phase={currentPhase} />
        </div>
      </div>
    </Link>
  )
}

export default Repo
