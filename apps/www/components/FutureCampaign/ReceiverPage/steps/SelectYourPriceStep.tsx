import { css } from 'glamor'
import { useState } from 'react'
import AssetImage from '../../../../lib/images/AssetImage'
import { StepProps } from '../../../Stepper/Stepper'
import { PriceSlider } from '../PriceSlider'
import BottomPanel from './BottomPanel'

const SelectYourPriceStep = ({
  stepperControls,
  onAdvance,
  initialPrice,
  onSubmit,
}: StepProps & {
  initialPrice: number
  onSubmit: (price: number) => void
}) => {
  const [price, setPrice] = useState(initialPrice)

  // TODO: render different content based on the selected price
  // Variants:
  // 'Dabei sein ist alles'
  //    - 5 <= Selected < average CHF
  // 'Mit dem Schwarm schwimmen'
  //    - average <= selected < 240 CHF
  // 'Der Standard'
  //    - selected = 240 CHF
  // 'Die vertrauensvolle Investition'
  //    - 240 < selected < 500 CHF
  // 'Die kühne Investition'
  //    - 500 <= selected < 1000 CHF
  // 'Das Maximum'
  //    - selected = 1000 CHF

  // TODO: implement price-slider that snaps to the clicked
  // price from above or to the nearest value from
  // the slider-thumb point

  return (
    <>
      <h2>Bar</h2>
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
          src='/static/climatelab/richardson.jpg'
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

      <PriceSlider onChange={(price) => setPrice(price)} />

      <BottomPanel
        steps={stepperControls}
        onAdvance={() => {
          onSubmit(price)
          onAdvance()
        }}
      >
        Für CHF {price.toFixed()} abonnieren
      </BottomPanel>
    </>
  )
}

export default SelectYourPriceStep

const styles = {
  main: css({
    flexGrow: 1,
    selfAlign: 'stretch',
  }),
}
