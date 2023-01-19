import { css } from 'glamor'
import AssetImage from '../../../../lib/images/AssetImage'
import BottomPanel from './BottomPanel'

const IntroductoryStep = ({ stepperControls, onAdvance }: StepProps) => {
  return (
    <>
      <h2>Foo</h2>
      <div {...styles.main}>
        <p>
          Aliqua veniam aliqua commodo laborum. Do non sit quis do exercitation
          pariatur eiusmod eu aliquip esse aliqua magna eu. Ut deserunt irure ex
          sint proident adipisicing ut anim ea sint. Cupidatat officia duis
          proident laborum. Non veniam velit occaecat culpa ut adipisicing amet
          esse adipisicing ipsum voluptate nulla ad duis quis. Duis incididunt
          ullamco elit cillum laborum eiusmod eiusmod. Elit nulla do sunt
          pariatur commodo Lorem et aliqua qui. Ad veniam pariatur non.
        </p>
        <AssetImage
          src='/static/climatelab/Klimaillu_Landingpage_5A47E1__Share.png'
          width={800}
          height={400}
        />
        <p>
          Aliqua veniam aliqua commodo laborum. Do non sit quis do exercitation
          pariatur eiusmod eu aliquip esse aliqua magna eu. Ut deserunt irure ex
          sint proident adipisicing ut anim ea sint. Cupidatat officia duis
          proident laborum. Non veniam velit occaecat culpa ut adipisicing amet
          esse adipisicing ipsum voluptate nulla ad duis quis. Duis incididunt
          ullamco elit cillum laborum eiusmod eiusmod. Elit nulla do sunt
          pariatur commodo Lorem et aliqua qui. Ad veniam pariatur non.
        </p>
      </div>
      <BottomPanel steps={stepperControls} onAdvance={onAdvance}>
        Wählen Sie Ihren Preis
      </BottomPanel>
    </>
  )
}

export default IntroductoryStep

const styles = {
  main: css({
    flexGrow: 1,
    selfAlign: 'stretch',
  }),
}
