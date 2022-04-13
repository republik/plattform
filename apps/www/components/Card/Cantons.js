import Aargau from './Cantons/Aargau'
import AppenzellAusserrhoden from './Cantons/AppenzellAusserrhoden'
import AppenzellInnerrhoden from './Cantons/AppenzellInnerrhoden'
import Basel from './Cantons/Basel'
import BaselLand from './Cantons/BaselLand'
import Bern from './Cantons/Bern'
import Fribourg from './Cantons/Fribourg'
import Geneva from './Cantons/Geneva'
import Glarus from './Cantons/Glarus'
import Graubuenden from './Cantons/Graubuenden'
import Jura from './Cantons/Jura'
import Lucerne from './Cantons/Lucerne'
import Neuchatel from './Cantons/Neuchatel'
import Nidwalden from './Cantons/Nidwalden'
import Obwalden from './Cantons/Obwalden'
import SanktGallen from './Cantons/SanktGallen'
import Schaffhausen from './Cantons/Schaffhausen'
import Schwyz from './Cantons/Schwyz'
import Solothurn from './Cantons/Solothurn'
import Tessin from './Cantons/Tessin'
import Thurgau from './Cantons/Thurgau'
import Uri from './Cantons/Uri'
import Valais from './Cantons/Valais'
import Vaud from './Cantons/Vaud'
import Zuerich from './Cantons/Zuerich'
import Zug from './Cantons/Zug'

const Parlament = (props) => (
  <svg
    width={props.size}
    height={props.size}
    viewBox='0 0 1150 1150'
    {...props}
  >
    <rect width='1150' height='1150' fill='#fff' />
    <g transform='translate(175 48)'>
      <path
        d='M395.5 562.5v95.7H198.9v174.2h196.6V1030h182.1V832.4h193.6V659.1'
        fill='none'
        stroke='#000'
        strokeWidth='20'
      />
      <path d='M302.2 22.2v66.68C238 100.8 185.9 157.6 185.9 231.3v152.2H12.11v275.6h70.56V454H256.4V309.7h131.5V454h173.7v205.1h70.6V383.5H458.4V231.3c0-70.4-48-125.9-108.4-140.74V22.2h-47.8zm19.9 135.1c35.7 0 65.8 29 65.8 74v3.4H256.4v-3.4c0-45 30.1-74 65.7-74z' />
      <path d='M68.15 233.7c-31.05 0-56.04 25-56.04 56v70.8H124.2v-70.8c0-31-25.01-56-56.05-56zM576.1 233.7c-31 0-56 25-56 56v70.8h112.1v-70.8c0-31-25-56-56.1-56z' />
    </g>
  </svg>
)

export default {
  bundesversammlung: Parlament,
  aargau: Aargau,
  'appenzell-ausserrhoden': AppenzellAusserrhoden,
  'appenzell-innerrhoden': AppenzellInnerrhoden,
  'basel-stadt': Basel,
  'basel-landschaft': BaselLand,
  bern: Bern,
  freiburg: Fribourg,
  genf: Geneva,
  glarus: Glarus,
  graubuenden: Graubuenden,
  jura: Jura,
  luzern: Lucerne,
  neuenburg: Neuchatel,
  nidwalden: Nidwalden,
  obwalden: Obwalden,
  'st-gallen': SanktGallen,
  schaffhausen: Schaffhausen,
  schwyz: Schwyz,
  solothurn: Solothurn,
  tessin: Tessin,
  thurgau: Thurgau,
  uri: Uri,
  wallis: Valais,
  waadt: Vaud,
  zuerich: Zuerich,
  zug: Zug,
}

export const nSeatsPerCanton = {
  aargau: 16,
  'appenzell-ausserrhoden': 1,
  'appenzell-innerrhoden': 1,
  'basel-stadt': 5,
  'basel-landschaft': 7,
  bern: 24,
  freiburg: 7,
  genf: 12,
  glarus: 1,
  graubuenden: 5,
  jura: 2,
  luzern: 9,
  neuenburg: 4,
  nidwalden: 1,
  obwalden: 1,
  'st-gallen': 12,
  schaffhausen: 2,
  schwyz: 4,
  solothurn: 6,
  tessin: 8,
  thurgau: 6,
  uri: 1,
  wallis: 8,
  waadt: 19,
  zuerich: 35,
  zug: 3,
}

export const sSeatsPerCanton = {
  aargau: 2,
  'appenzell-ausserrhoden': 1,
  'appenzell-innerrhoden': 1,
  'basel-stadt': 1,
  'basel-landschaft': 1,
  bern: 2,
  freiburg: 2,
  genf: 2,
  glarus: 2,
  graubuenden: 2,
  jura: 2,
  luzern: 2,
  neuenburg: 2,
  nidwalden: 1,
  obwalden: 1,
  'st-gallen': 2,
  schaffhausen: 2,
  schwyz: 2,
  solothurn: 2,
  tessin: 2,
  thurgau: 2,
  uri: 2,
  wallis: 2,
  waadt: 2,
  zuerich: 2,
  zug: 2,
}
