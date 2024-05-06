import { CsvChart } from './csv-chart'

export default function Demo() {
  return (
    <div>
      <CsvChart
        config={{
          type: 'Bar',
          numberFormat: '%',
          color: 'concern',
          colorRange: [
            '#3D155B',
            '#542785',
            '#A46FDA',
            '#C79CF0',
            '#bbb',
            '#bbb',
            '#D6FA90',
            '#B9EB56',
            '#90AA00',
            '#62790E',
          ],
          colorLegend: true,
          colorLegendValues: ['weniger', 'gleich', 'mehr'],
          domain: [0, 1],
          sort: 'none',
          colorSort: 'none',
        }}
        values={`
concern,value
weniger,0.1
0.1,0.1
0.2,0.1
0.3,0.1
gleich,0.1
0.5,0.1
0.6,0.1
0.7,0.1
0.8,0.1
mehr,0.1
    `.trim()}
      />
    </div>
  )
}
