import { hierarchy } from 'd3-hierarchy'
import { nest } from 'd3-collection'
import { sum } from 'd3-array'

// Make sure to update share image when changing data
// - static/social-media/aktionariat.png
const data = [
  {
    Kategorie: 'Project R Gen',
    Aktionärin: 'Project R',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '490000',
  },
  {
    Kategorie: 'Gründerteam',
    Aktionärin: 'Susanne Sugimoto',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '70000',
  },
  {
    Kategorie: 'Gründerteam',
    Aktionärin: 'Laurent Burst',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '70000',
  },
  {
    Kategorie: 'Gründerteam',
    Aktionärin: 'Nadja Schnetzler',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '70000',
  },
  {
    Kategorie: 'Gründerteam',
    Aktionärin: 'Christof Moser',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '70000',
  },
  {
    Kategorie: 'Gründerteam',
    Aktionärin: 'Constantin Seibt',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '70000',
  },
  {
    Kategorie: 'Gründerteam',
    Aktionärin: 'Clara Vuillemin',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '40000',
  },
  {
    Kategorie: 'Gründerteam',
    Aktionärin: 'Patrick Recher',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '40000',
  },
  {
    Kategorie: 'Gründerteam',
    Aktionärin: 'Thomas Preusse',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '10000',
  },
  {
    Kategorie: 'Gründerteam',
    Aktionärin: 'Richard Höchner',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '10000',
  },
  {
    Kategorie: 'Gründerteam',
    Aktionärin: 'Sylvie Reinhard',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '10000',
  },
  {
    Kategorie: 'Gründerteam',
    Aktionärin: 'David Schärer',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '10000',
  },
  {
    Kategorie: 'Gründerteam',
    Aktionärin: 'Tobias Peier',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '10000',
  },
  {
    Kategorie: 'Gründerteam',
    Aktionärin: 'Daniel Binswanger',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '10000',
  },
  {
    Kategorie: 'Eigenaktien Republik',
    Aktionärin: 'Republik AG',
    Typ: 'A',
    'Nominal CHF': '0.10',
    Anzahl: '20000',
  },
  {
    Kategorie: 'Geldgeber',
    Aktionärin: 'Gebrüder Meili',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '26111',
  },
  {
    Kategorie: 'Geldgeber',
    Aktionärin: 'Adrian Gasser',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '5556',
  },
  {
    Kategorie: 'Geldgeber',
    Aktionärin: 'Mettiss AG',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '4445',
  },
  {
    Kategorie: 'Geldgeber',
    Aktionärin: 'Georg und Bertha Schwyzer-Winiker-Stiftung',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '3334',
  },
  {
    Kategorie: 'Geldgeber',
    Aktionärin: 'Steff Fischer',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '2778',
  },
  {
    Kategorie: 'Geldgeber',
    Aktionärin: 'Luzius Meisser',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '2223',
  },
  {
    Kategorie: 'Geldgeber',
    Aktionärin: 'Andrea Jansen',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '1112',
  },
  {
    Kategorie: 'Geldgeber',
    Aktionärin: 'Even Meier, Siolag Holding AG',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '2223',
  },
  {
    Kategorie: 'Geldgeber',
    Aktionärin: 'Sara Rüegg',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '1112',
  },
  {
    Kategorie: 'Geldgeber',
    Aktionärin: 'Ursula Klar',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '2223',
  },
  {
    Kategorie: 'Geldgeber',
    Aktionärin: 'Michael Wehrli',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '2223',
  },
  {
    Kategorie: 'Geldgeber',
    Aktionärin: 'Monoceros Holding AG',
    Typ: 'B',
    'Nominal CHF': '0.40',
    Anzahl: '2223',
  },
]

export const groupped = hierarchy({
  children: nest()
    .key((d) => d.Kategorie)
    .entries(data)
    .map((d) => {
      if (d.values.length > 1) {
        return {
          ...d.values[0],
          Anzahl: undefined,
          children: d.values,
        }
      }
      return d.values[0]
    }),
}).sum((d) => d.Anzahl)

export const total = sum(data, (d) => +d.Anzahl)
export const totalChf = sum(data, (d) => +d.Anzahl * d['Nominal CHF'])

export const colors = {
  Geldgeber: 'rgb(157, 38, 14)',
  Gründerteam: 'rgb(54, 71, 63)',
  'Eigenaktien Republik': '#979797',
  'Project R Gen': 'rgb(65, 171, 29)',
}
