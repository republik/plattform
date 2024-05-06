import {
  ChartLead,
  ChartLegend,
  ChartTitle,
  Editorial,
} from '@project-r/styleguide'
import { CsvChart } from './csv-chart'

export default function Demo() {
  return (
    <div>
      <ChartTitle>Velobeschluss</ChartTitle>
      <ChartLead>Angenommen mit 73.6% Ja</ChartLead>
      <CsvChart
        config={{
          type: 'Bar',
          numberFormat: '.1%',
          color: 'vote',
          colorRange: 'diverging1',
          inlineValue: true,
          inlineLabel: 'vote',
          inlineSecondaryLabel: 'count',
          y: 'canton',
        }}
        values={`
canton,vote,value,count
,Ja,0.736,1475165 Stimmen
,Nein,0.264,529268 Stimmen
Zürich,Ja,0.719,
Zürich,Nein,0.281,
Bern,Ja,0.722,
Bern,Nein,0.278,
Luzern,Ja,0.687,
Luzern,Nein,0.313,
    `.trim()}
      />
      <ChartLegend>
        Quelle:{' '}
        <Editorial.A href='https://www.bk.admin.ch/ch/d/pore/va/20180923/det620.html'>
          Bundeskanzlei
        </Editorial.A>
      </ChartLegend>
    </div>
  )
}
