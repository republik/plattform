import { useRouter } from 'next/router'
import {
  Interaction,
  Center,
  ColorContextLocalExtension,
  useColorContext,
} from '@project-r/styleguide'

import { useMe } from '../../lib/context/MeContext'

import TrialForm from '../Trial/Form'

import { climateColors, climateColorsReverse } from './config'

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
  const { me } = useMe()
  const { query } = useRouter()

  const showTeaser =
    mode === 'banner' ||
    !me?.roles?.includes('climate') ||
    !!query.climateSignup
  // +++Why we use somthing like "!!query.climateSignup"+++
  //
  // In paynote mode, we only show the paynote if a reader doesn't have the role
  // 'climate' assigned to herself. She can then sign up through this paynote.
  // However, once the process is complete, without the query.climateSignup clause,
  // the paynote would vanish like poof! (because now our dear reader has got
  // the climate role in the profile).
  // It's much nicer to show a thank you note, or a link to the HQ or whatever.
  //
  // Check: apps/www/components/Trial/Form.js L.155-182 for an example on how
  // to push a query param to the route for this use case.

  if (!showTeaser) return null

  return (
    <ColorContextLocalExtension
      localColors={mode === 'paynote' ? climateColorsReverse : climateColors}
    >
      {/* since the page is white and the teaser is white too, inverting the colors */}
      {/* is a cheap trick we use regularly to create visual contrast. */}
      <InnerTeaser mode={mode} />
    </ColorContextLocalExtension>
  )
}

export default ClimatelabTeaser
