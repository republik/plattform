import { CsvChart } from './csv-chart'

export default function Demo() {
  return (
    <div>
      <CsvChart
        config={{
          type: 'Bar',
          y: 'gender',
          color: 'age',
          colorLegend: true,
          showBarValues: true,
          sort: 'none',
          domain: [-2000, 20000],
          xTicks: [0],
        }}
        values={`
age,gender,value
0-9,Women,71
10-19,Women,504
20-29,Women,2270
30-39,Women,2351
40-49,Women,2728
50-59,Women,3233
60-69,Women,1613
70-79,Women,1315
80+,Women,2468
0-9,Men,84
10-19,Men,361
20-29,Men,1534
30-39,Men,1761
40-49,Men,2042
50-59,Men,2964
60-69,Men,2034
70-79,Men,1566
80+,Men,1597
80+,Cats,-100
0-9,Cats,100
10-19,Cats,100
20-29,Cats,10
80+,Dogs,-200
    `.trim()}
      />
    </div>
  )
}
