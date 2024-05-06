import { ChartLegend, ChartTitle } from '@project-r/styleguide'
import { CsvChart } from './csv-chart'

export default function Demo() {
  return (
    <div>
      <ChartTitle>Kriminalitätsfurcht 2012</ChartTitle>
      <CsvChart
        config={{
          type: 'Bar',
          numberFormat: '%',
          color: 'concern',
          colorRange: 'diverging2',
          colorLegend: true,
          y: 'category',
          domain: [0, 1],
          sort: 'none',
          colorSort: 'none',
          highlight: "datum.category == 'Allgemein'",
        }}
        values={`
category,concern,value
Allgemein,gar nicht,0.416
Allgemein,etwas,0.413
Allgemein,ziemlich,0.124
Allgemein,sehr stark,0.047
Körperverletzung,gar nicht,0.535
Körperverletzung,etwas,0.299
Körperverletzung,ziemlich,0.073
Körperverletzung,sehr stark,0.093
Einbruch,gar nicht,0.427
Einbruch,etwas,0.39
Einbruch,ziemlich,0.077
Einbruch,sehr stark,0.107
Raub,gar nicht,0.464
Raub,etwas,0.352
Raub,ziemlich,0.074
Raub,sehr stark,0.11
Sexuelle Belästigung,gar nicht,0.692
Sexuelle Belästigung,etwas,0.167
Sexuelle Belästigung,ziemlich,0.047
Sexuelle Belästigung,sehr stark,0.093
    `.trim()}
      />
      <ChartLegend>Quelle: Deutscher Viktimisierungssurvey 2012.</ChartLegend>
    </div>
  )
}
