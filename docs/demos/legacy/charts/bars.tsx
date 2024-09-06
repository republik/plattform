import { ChartLead, ChartLegend, ChartTitle } from '@project-r/styleguide'
import { CsvChart } from './csv-chart'

export default function Demo() {
  return (
    <div>
      <ChartTitle>Abgabenquote im internationalen Vergleich</ChartTitle>
      <ChartLead>in Prozent des BIP 2015</ChartLead>
      <CsvChart
        config={{
          type: 'Bar',
          numberFormat: '.0%',
          y: 'country',
          category: "datum.country == 'Schweiz' ? '1' : '0'",
          showBarValues: true,
        }}
        values={`
country,value
Frankreich,0.455
Österreich,0.435
Italien,0.433
Deutschland,0.369
Schweiz,0.279
USA,0.264
Irland,0.236
    `.trim()}
      />
      <ChartLegend>
        Quelle: OECD 2015. Revenue Statistics 1965-2014. Bundesministerium der
        Finanzen 2016. Die wichtigsten Steuern im internationalen Vergleich
        2015.
      </ChartLegend>
    </div>
  )
}
