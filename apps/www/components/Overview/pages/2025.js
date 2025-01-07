import { Highlight } from '../Elements'
import Page from '../Page'

const text = {
  Januar: (p) => <></>,
  Februar: (p) => <></>,
  März: (p) => <></>,
  April: (p) => <></>,
  Mai: (p) => <></>,
  Juni: (p) => <></>,
  Juli: (p) => <></>,
  August: (p) => <></>,
  September: (p) => <></>,
  Oktober: (p) => <></>,
  November: (p) => <></>,
  Dezember: (p) => <></>,
}

const Overview2025 = (props) => <Page {...props} year={2025} text={text} />

export default Overview2025
