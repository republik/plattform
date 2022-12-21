import { useMe } from '../../../lib/context/MeContext'
import { CLIMATE_LAB_ROLE } from '../constants'
import Button from '../shared/Button'

type ClimateLabTrialFormProps = {
  children?: React.ReactNode
}

const ClimateLabTrialForm = (props: ClimateLabTrialFormProps) => {
  const { me } = useMe()
  const roles = me?.roles ?? []

  const isClimateLabMember = roles.includes(CLIMATE_LAB_ROLE)

  if (isClimateLabMember) {
    return <p>Zum HQ</p>
  }

  if (me) {
    return <p>Ich bin dabei</p>
  }

  return (
    <div>
      <input type='email' placeholder='E-Mail-Adresse' />
      <Button>Ich bin dabei</Button>

      <p>
        Schon dabei? <a href='#'>Einloggen</a>
      </p>
    </div>
  )
}

export default ClimateLabTrialForm
