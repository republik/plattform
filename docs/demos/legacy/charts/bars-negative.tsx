import { ChartLead, ChartTitle } from '@project-r/styleguide'
import { CsvChart } from './csv-chart'

export default function Demo() {
  return (
    <div>
      <ChartTitle>Wie positiv ist Alkoholkonsum?</ChartTitle>
      <ChartLead>Konstruktivität durch scharfe, negative Kritik</ChartLead>
      <CsvChart
        config={{
          type: 'Bar',
          numberFormat: '.0%',
          y: 'alk',
          showBarValues: true,
          unit: 'Vol.',
          domain: [-1, 0],
          sort: 'none',
        }}
        values={`
alk,value
Bier,-0.05
Wein<sub>en</sub>,-0.13
Vodka,-0.4
Absinth,-0.8
    `.trim()}
      />
    </div>
  )
}
