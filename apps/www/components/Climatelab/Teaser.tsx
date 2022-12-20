import {
  Interaction,
  Center,
  ColorContextLocalExtension,
  useColorContext,
} from '@project-r/styleguide'

import TrialForm from '../Trial/Form'

import { climateColorsReverse } from './config'

// we use two different modes for the teaser:
// - banner: the teaser is always shown, regardless of the user's membership status
// - paynote: the teaser is only shown if the user is not a member with role "climate"
type TeaserMode = 'banner' | 'paynote'

// this is a separate component so we can use the color context hook
// (not possible in the main component, because the provider is defined there)
const InnerTeaser: React.FC<{ mode: TeaserMode }> = ({ mode }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      style={{ padding: '50px 0' }}
      {...colorScheme.set('background', 'default')}
    >
      <Center>
        <Interaction.H1>
          Die Klimakrise ist hier.
          <br />
          Die Lage ist ernst.
          <br />
          Was tun?
        </Interaction.H1>
        <TrialForm />
      </Center>
    </div>
  )
}

const ClimatelabTeaser: React.FC<{ mode: TeaserMode }> = ({
  mode = 'banner',
}) => {
  return (
    <ColorContextLocalExtension localColors={climateColorsReverse}>
      <InnerTeaser mode={mode} />
    </ColorContextLocalExtension>
  )
}

export default ClimatelabTeaser
