import { css } from 'glamor'
import { fontStyles, mediaQueries } from '@project-r/styleguide'
import { useMe } from '../../../lib/context/MeContext'
import { CLIMATE_LAB_ROLE } from '../constants'
import Button from '../shared/Button'
import Input from './Input'
import { ClimatelabColors } from '../ClimatelabColors'

type ClimateLabTrialFormProps = {
  children?: React.ReactNode
}

const ClimateLabTrialForm = (props: ClimateLabTrialFormProps) => {
  const { me } = useMe()
  const roles = me?.roles ?? []

  const isClimateLabMember = roles.includes(CLIMATE_LAB_ROLE)

  if (isClimateLabMember) {
    return <Button>Zum Klimalabor HQ</Button>
  }

  if (me) {
    return <Button>Ich bin dabei</Button>
  }

  return (
    <div {...styles.wrapper}>
      <Input type='email' placeholder='E-Mail-Adresse' />
      <Button>Ich bin dabei</Button>

      <p {...styles.text}>
        Schon dabei?{' '}
        <a {...styles.link} href='#'>
          Einloggen
        </a>
      </p>
    </div>
  )
}

export default ClimateLabTrialForm

const styles = {
  wrapper: css({
    '> * + *': {
      marginTop: '2rem',
    },
  }),
  text: css({
    ...fontStyles.sansSerifMedium,
    lineHeight: '1.6em',
    fontSize: 24,
  }),
  link: css({
    color: ClimatelabColors.text,
  }),
}
