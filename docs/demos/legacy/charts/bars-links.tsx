import { ChartLegend, ChartTitle, Editorial } from '@project-r/styleguide'
import { CsvChart } from './csv-chart'

export default function Demo() {
  return (
    <div>
      <ChartTitle>Häufigste Namen bei der Republik</ChartTitle>
      <CsvChart
        config={{
          type: 'Bar',
          numberFormat: 's',
          sort: 'descending',
          link: 'href',
          inlineValue: true,
          inlineValueUnit: 'Konten',
          y: 'name',
        }}
        values={`
name,value,href
Thomas,494,https://www.republik.ch/~tpreusse
Peter,464
Daniel,415,https://www.republik.ch/~daniel
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
