import React from 'react'

import { FlyerTile, Flyer, ColorContextProvider } from '@project-r/styleguide'

import TrialForm from '../Trial/Form'

const Stoerer: React.FC = () => {
  return (
    <ColorContextProvider colorSchemeKey='dark'>
      <FlyerTile>
        <Flyer.H3>Did you know?</Flyer.H3>
        <Flyer.P>
          A single journalist consumes around 2000 calories a day, every day.
          And <em>Republik Magazin</em> employs over 34 of them. Journalism is
          expensive, especially when you are paying for your own food.
        </Flyer.P>
        <Flyer.P>But there is no such thing as a free lunch.</Flyer.P>
        <TrialForm minimal black />
      </FlyerTile>
    </ColorContextProvider>
  )
}

export default Stoerer
