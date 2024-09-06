import { CsvChart } from './csv-chart'

export default function Demo() {
  return (
    <div>
      <CsvChart
        config={{
          type: 'Bar',
          y: 'category',
          sort: 'none',
          colorSort: 'none',
          color: 'label',
          colorRange: ['#fdd49e', '#fdbb84', '#fc8d59'],
          colorDarkMapping: {
            '#fdd49e': '#807dba',
            '#fdbb84': '#6a51a3',
            '#fc8d59': '#54278f',
          },
          inlineValue: true,
          inlineLabel: 'label',
          inlineLabelPosition: 'pos',
        }}
        values={`
category,value,label,pos
Ca. 3500 Kilometer mehr mit ÖV,79,a,
8 bis 15 Stunden mehr Flug pro Jahr,2074,a,center
9 bis 16 Stunden mehr Flug pro Jahr,2074,a,
9 bis 16 Stunden mehr Flug pro Jahr,200,b,
10 bis 16 Stunden mehr Flug pro Jahr,2074,a,
10 bis 16 Stunden mehr Flug pro Jahr,200,b,right
10 bis 16 Stunden mehr Flug pro Jahr,200,c,left
Verzicht auf 10 bis 16 Stunden Flug pro Jahr,-2074,a,
Verzicht auf 10 bis 16 Stunden Flug pro Jahr,-200,b,left
Verzicht auf 10 bis 16 Stunden Flug pro Jahr,-200,c,right
Verzicht auf 9 bis 16 Stunden Flug pro Jahr,-2074,a,
Verzicht auf 9 bis 16 Stunden Flug pro Jahr,-200,b,
Verzicht auf 8 bis 15 Stunden Flug pro Jahr,-2074,a,center
Verzicht auf ca. 3500 Kilometer mit ÖV,-79,a,
    `.trim()}
      />
    </div>
  )
}
