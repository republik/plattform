import Frame from '../components/Frame'
import { Button, colors } from '@project-r/styleguide'

const Klimalabor = () => {
  const meta = {
    title: 'Klimalabor Landing Page',
    description: 'Langing Page',
  }
  return (
    <Frame meta={meta} isClimate={true}>
      <p>
        Und hier kommt <span>Und hier dann ein gelber Balken dahiner</span>
        viel Inhalt
      </p>
      <Button primary>Das ist ein Button</Button>
    </Frame>
  )
}

export default Klimalabor
