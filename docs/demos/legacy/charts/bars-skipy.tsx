import { CsvChart } from './csv-chart'

export default function Demo() {
  return (
    <div>
      <CsvChart
        config={{
          type: 'Bar',
          y: 'type',
          column: 'category',
          columnSort: 'none',
          sort: 'descending',
          color: 'type',
          showBarValues: true,
          colorRange: ['#2ca02c', '#9467bd'],
        }}
        values={`
category,type,value,Q_lower,Q_upper
"Geschäftsführung, leitende Funktion",Mann,11100,8665,14523,
"Geschäftsführung, leitende Funktion",Frau,8825,6786,11668,
"Führungskräfte Gastronomie, Handel",Mann,6050,5047,7411,
"Führungskräfte Gastronomie, Handel",Frau,4900,4613,5512,
Ärztinnen,Mann,9709,7262,13265,
Ärztinnen,Frau,7491,6395,9452
    `.trim()}
      />
    </div>
  )
}
