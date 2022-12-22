import { Overlay, OverlayToolbar, OverlayBody } from '@project-r/styleguide'
import { useMe } from '../../../lib/context/MeContext'
import TrialForm from '../../Trial/Form'

type TrialFormOverlayProps = {
  onClose: () => void
}

const TrialFormOverlay = ({ onClose }: TrialFormOverlayProps) => {
  const { me } = useMe()

  return (
    <Overlay mini onClose={() => onClose()}>
      <OverlayBody>
        <TrialForm
          accessCampaignId='3684f324-b694-4930-ad1a-d00a2e00934b'
          context='climate'
          skipForMembers={false}
          shouldSkipTrialForm={me?.roles.some((role) => role === 'climate')}
          payload={{}}
        />
      </OverlayBody>
    </Overlay>
  )
}

export default TrialFormOverlay
