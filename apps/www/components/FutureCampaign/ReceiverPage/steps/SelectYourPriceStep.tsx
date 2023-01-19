import { css } from 'glamor'
import { useState } from 'react'
import AssetImage from '../../../../lib/images/AssetImage'
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
  // 5 <= Selected < 240 CHF : Unter Normalpreis
  // Selected = 240 CHF: Normalpreis
  // Selected = Average: Durchschnittspreis
  // 240 < Selected < 500 CHF: Die vertrauensvolle Investition
  // 500 <= Selected < 1000 CHF: Die kühne Investition
  // 1000 = SELECTED CHF: Das Maximum

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
      <input
        type='range'
        min={5}
        max={1000}
        defaultValue={initialPrice}
        onChange={(e) => {
          setPrice(parseInt(e.target.value))
        }}
      />
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
