import { ChartLead, ChartLegend, ChartTitle } from '@project-r/styleguide'
import { CsvChart } from './csv-chart'

export default function Demo() {
  return (
    <div>
      <ChartTitle>
        Themenstruktur der verschiedenen Formen der Weiterbildung 2014
      </ChartTitle>
      <ChartLead>in Prozent</ChartLead>
      <CsvChart
        config={{
          type: 'Bar',
          color: 'type',
          colorSort: 'none',
          numberFormat: '%',
          sort: 'none',
          column: 'type',
          y: 'category',
          columns: 3,
          minInnerWidth: 250,
        }}
        values={`
  category,type,value
  "Sprachen, Kultur, Politik",Nicht-berufsbezogene Weiterbildung,0.32
  Pädagogik und Sozialkompetenz,Nicht-berufsbezogene Weiterbildung,0.07
  Gesundheit und Sport,Nicht-berufsbezogene Weiterbildung,0.26
  "Wirtschaft, Arbeit, Recht",Nicht-berufsbezogene Weiterbildung,0.12
  "Natur, Technik, Computer",Nicht-berufsbezogene Weiterbildung,0.23
  nicht oder nur einstellig klassifizierbar,Nicht-berufsbezogene Weiterbildung,0.01
  "Sprachen, Kultur, Politik",Individuelle berufsbezogene Weiterbildung,0.15
  Pädagogik und Sozialkompetenz,Individuelle berufsbezogene Weiterbildung,0.17
  Gesundheit und Sport,Individuelle berufsbezogene Weiterbildung,0.21
  "Wirtschaft, Arbeit, Recht",Individuelle berufsbezogene Weiterbildung,0.26
  "Natur, Technik, Computer",Individuelle berufsbezogene Weiterbildung,0.17
  nicht oder nur einstellig klassifizierbar,Individuelle berufsbezogene Weiterbildung,0.04
  "Sprachen, Kultur, Politik",Betriebliche Weiterbildung,0.05
  Pädagogik und Sozialkompetenz,Betriebliche Weiterbildung,0.07
  Gesundheit und Sport,Betriebliche Weiterbildung,0.19
  "Wirtschaft, Arbeit, Recht",Betriebliche Weiterbildung,0.41
  "Natur, Technik, Computer",Betriebliche Weiterbildung,0.24
  nicht oder nur einstellig klassifizierbar,Betriebliche Weiterbildung,0.04
      `.trim()}
      />
      <ChartLegend>Quelle: Adult Education Survey 2014.</ChartLegend>
    </div>
  )
}
