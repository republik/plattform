import {
  Center,
  Editorial,
  InfoBox,
  InfoBoxTitle,
  InfoBoxText,
} from '@project-r/styleguide'
import Frame from '../Frame'
import { Scrolly } from './Scrolly'

const DotApp = () => {
  return (
    <Frame>
      <Center>
        <div>
          <Editorial.Headline>
            Die Wirksamkeit von IVF wird überschätzt
          </Editorial.Headline>
          <Editorial.Lead>
            Die Schule ist aus, die Winterferien beginnen. Nur: Wo bleibt der
            Schnee. Eine Einordnung in vier Schritten.
          </Editorial.Lead>
          <p className='byline'>
            Von Karen Merkel und Felix Michel, 23.03.2023
          </p>
        </div>
        <Scrolly />
        <section className='content' style={{ minHeight: '100vh' }}>
          <InfoBox>
            <InfoBoxTitle>Zu den Daten</InfoBoxTitle>

            <InfoBoxText>
              Die Daten zu den Niederschlägen stammen von Meteoschweiz. Für die
              Referenzperioden wurden die Durchschnittswerte berechnet. Die
              Daten zum Gletscher Plaine Morte wurden von Matthias Huss
              aufbereitet und der Republik zur Verfügung gestellt.
            </InfoBoxText>
          </InfoBox>
        </section>
      </Center>
    </Frame>
  )
}

export default DotApp
