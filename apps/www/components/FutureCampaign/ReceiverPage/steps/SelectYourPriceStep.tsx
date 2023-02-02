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

  return (
    <>
      <div {...styles.container}>
        <div>
          <h2>Bar</h2>
          <div {...styles.main}>
            <p>
              Aliqua veniam aliqua commodo laborum. Do non sit quis do
              exercitation pariatur eiusmod eu aliquip esse aliqua magna eu. Ut
              deserunt irure ex sint proident adipisicing ut anim ea sint.
              Cupidatat officia duis proident laborum. Non veniam velit occaecat
              culpa ut adipisicing amet esse adipisicing ipsum voluptate nulla
              ad duis quis. Duis incididunt ullamco elit cillum laborum eiusmod
              eiusmod. Elit nulla do sunt pariatur commodo Lorem et aliqua qui.
              Ad veniam pariatur non.
            </p>
            <AssetImage
              src='/static/climatelab/richardson.jpg'
              width={800}
              height={400}
            />
            <p>
              Aliqua veniam aliqua commodo laborum. Do non sit quis do
              exercitation pariatur eiusmod eu aliquip esse aliqua magna eu. Ut
              deserunt irure ex sint proident adipisicing ut anim ea sint.
              Cupidatat officia duis proident laborum. Non veniam velit occaecat
              culpa ut adipisicing amet esse adipisicing ipsum voluptate nulla
              ad duis quis. Duis incididunt ullamco elit cillum laborum eiusmod
              eiusmod. Elit nulla do sunt pariatur commodo Lorem et aliqua qui.
              Ad veniam pariatur non.
            </p>
          </div>
        </div>

        <div>
          <PriceSlider onChange={(price) => setPrice(price)} />
        </div>
      </div>
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
  container: css({
    display: 'flex',
  }),
}
