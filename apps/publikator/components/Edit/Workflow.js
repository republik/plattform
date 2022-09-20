import { Phase } from '../Repo/Phases'
import { useState } from 'react'
import {
  Overlay,
  OverlayToolbar,
  OverlayBody,
  Label,
} from '@project-r/styleguide'
import Checklist, { getMilestones } from '../VersionControl/Checklist'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import withT from '../../lib/withT'

const WorkflowOverlay = withT(({ t, onClose, commitId, repoId, disabled }) => {
  return (
    <Overlay onClose={onClose}>
      <OverlayToolbar title='Phasen' onClose={onClose} />
      <OverlayBody>
        {disabled && <Label>{t('editor/workflow/uncommittedChanges')}</Label>}
        <Checklist disabled={disabled} repoId={repoId} commitId={commitId} />
      </OverlayBody>
    </Overlay>
  )
})

const PhaseLabel = compose(
  graphql(getMilestones, {
    options: {
      fetchPolicy: 'network-only',
      ssr: false,
    },
  }),
)(({ repoId, data, onClick }) => {
  const phase = data?.repo?.currentPhase
  if (!phase) return null
  return <Phase phase={phase} onClick={onClick} />
})

export const PhaseSummary = ({ commitId, repoId, hasUncommittedChanges }) => {
  const [overlayVisible, setOverlayVisible] = useState(false)
  if (!repoId) return null
  return (
    <div>
      <PhaseLabel repoId={repoId} onClick={() => setOverlayVisible(true)} />
      {!!overlayVisible && (
        <WorkflowOverlay
          onClose={() => setOverlayVisible(false)}
          commitId={commitId}
          repoId={repoId}
          disabled={!!hasUncommittedChanges}
        />
      )}
    </div>
  )
}
