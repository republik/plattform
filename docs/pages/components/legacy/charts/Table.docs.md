```react
<div>
  <ChartTitle>Ländervergleich</ChartTitle>
  <CsvChart
    config={{
      "type": "Table",
      "numberFormat": "s",
      "tableColumns": [
        {
          "column": "Indikator",
          "type": "string"
        },
        {
          "column": "Afghanistan",
          "type": "number",
          "width": "170"
        },
        {
          "column": "Schweiz",
          "type": "number",
          "width": "170"
        }
      ]
    }}
    values={`
Indikator,Afghanistan,Schweiz
Gesamtbevölkerung,38,8.6
"BNE pro Kopf (USD, kaufkraftbereinigt)",2229,69394
"Kindersterblichkeit (pro 1000 Kindern unter 5 Jahren)",62.3,4.1
"Jahre in der Schule (Mittelwert)",3.9,13.4
    `.trim()} />
  <ChartLegend>Quelle: Entwicklungsprogramm der Vereinten Nationen.</ChartLegend>
</div>
```

## Colored Backgrounds

You may add a background color to a column. Supported are `thresholds` and `ordinal` scales.

You can set the default sorting to a specific column by setting `defaultSortColumn` to a column name of your data.

### Thresholds

```react
<div>
  <ChartTitle>Viel Gesundheit, wenig Energie</ChartTitle>
  <ChartLead>Über- bzw. Untergewichtung von Sektoren im PAB</ChartLead>
  <CsvChart
    config={{
      "type": "Table",
      "colorRange": [
        "#762a83", "#af8dc3", "#e7d4e8", "#d9f0d3", "#7fbf7b", "#1b7837"
      ],
      "thresholds": [-0.5, -0.3, 0, 0.3, 0.5],
      "tableColumns": [
        {
          "column": "Branche",
          "type": "string"
        },
        {
          "column": "Gewichtung",
          "type": "number",
          "width": "170",
          "color": true
        }
      ],
      "numberFormat": "+.0%",
      "defaultSortColumn": "Gewichtung"
    }}
    values={`
Branche,Gewichtung
Gesundheit,0.34
Langlebige Haushaltswaren,0.30
Finanz,0.17
Telecom,0.07
Technologie,-0.03
Basiskonsumgüter,-0.08
Industrie,-0.18
Bau und Immobilien,-0.34
Materialien,-0.38
Versorger,-0.51
Energie,-0.52
    `.trim()} />
  <ChartLegend>Lesebeispiel: Der Gesundheitssektor ist im Paris-Aligned Benchmark gegenüber dem Stoxx Europe 600 Basisindex um 34 Prozent übergewichtet. Quelle: Stoxx.</ChartLegend>
</div>
```

### Ordinal Scale

```react
<div>
  <ChartTitle>Öffentlich, privat – oder beides?</ChartTitle>
  <ChartLead>Welche Angebote in den einzelnen europäischen Ländern dominieren</ChartLead>
  <CsvChart
    t={t}
    config={{
      "type": "Table",
      "tableColumns": [
        {
          "column": "Land",
          "type": "string",
        },
        {
          "column": "E-ID-Angebote",
          "type": "string",
          "width": "300",
          "color": true
        }
      ],
      "colorMap": {
        "Öffentliche Angebote dominieren": "#66c2a5",
        "Öffentliche und private": "#fc8d62",
        "Private Angebote dominieren": "#8da0cb"
      }
    }}
    values={`
Land,E-ID-Angebote
Kroatien,Öffentliche Angebote dominieren
Belgien,Öffentliche und private
Dänemark,Private Angebote dominieren
Deutschland,Öffentliche und private
Estland,Öffentliche Angebote dominieren
Frankreich,Öffentliche und private
Grossbritannien,Private Angebote dominieren
Italien,Öffentliche und private
Lettland,Öffentliche und private
Litauen,Öffentliche Angebote dominieren
Luxemburg,Öffentliche und private
Malta,Öffentliche Angebote dominieren
Niederlande,Öffentliche und private
Norwegen,Öffentliche und private
Österreich,Öffentliche und private
Polen,Öffentliche Angebote dominieren
Portugal,Öffentliche Angebote dominieren
Schweden,Öffentliche und private
Schweiz,Private Angebote dominieren
Slowakei,Öffentliche Angebote dominieren
Spanien,Öffentliche Angebote dominieren
Tschechien,Öffentliche und private
Slowenien,Öffentliche und private
Finnland,Öffentliche und private
Zypern,Öffentliche Angebote dominieren
    `.trim()} />
  <ChartLegend></ChartLegend>
</div>
```

## Collapsable

```react
<div>
  <ChartTitle>Von der EU sanktioniert – von der Schweiz unbehelligt</ChartTitle>
  <CsvChart
    t={t}
    config={{
      "type": "Table",
      "tableColumns": [
        {
          "column": "Name"
        },
        {
          "column": "Programm",
          "color": true
        },
        {
          "column": "Eintragsdatum",
          "type": "date",
        }
      ],
      "defaultSortColumn": "Programm",
      "colorMap": {
        "CYB": "#1f77b4",
        "CHEM": "#ff7f0e",
        "HR": "#2ca02c",
        "UKR": "#d62728"
      },
      "collapsable": true,
      "timeFormat": "%d.%m.%Y",
      "timeParse": "%d.%m.%Y",
    }}
    values={`
Name,Eintragsdatum,Programm
Ruslan BOSHIROV,21.01.2019,CHEM
Wiktor Fedorowytsch Janukowytsch,05.03.2019,UKR
"SEREBRIAKOV, Evgenii Mikhaylovich",30.07.2020,CYB
Main Centre for Special Technologies (GTsST) of the Main Directorate of the General Staff of the Armed Forces of the Russian Federation (GU/GRU) ('SANDWORM'),30.07.2020,CYB
Viktor Ivanovych RATUSHNIAK,05.03.2019,UKR
Pawel Anatoljewitsch Popow,15.10.2020,CHEM
GRU 85th Main Special Service Centre (GTsSS) (APT 28),22.10.2020,CYB
Gruppe Wagner,13.12.2021,HR
Stanislav Evgenievitch DYCHKO,13.12.2021,HR
Valeriy Nikolaevich ZAKHAROV,13.12.2021,HR
Volfovitj Aleksandr GRIGORJEVITJ,25.02.2022,UKR
State Research Institute of Organic Chemistry and Technology,15.10.2020,CHEM
Igor Olegovich KOSTYUKOV,21.01.2019,CHEM
Alexandr Petrovich KALASHNIKOV,02.03.2021,HR
Igor Wiktorowitsch Krasnow,02.03.2021,HR
Aiub Vakhaevich KATAEV,07.12.2021,HR
Vladimir Stepanovich ALEXSEYEV,21.01.2019,CHEM
Vitaly Yuryevich ZAKHARCHENKO,05.03.2019,UKR
Dmitry Sergeyevich BADIN,22.10.2020,CYB
Aleksei Sergeyvic MORENETS,30.07.2020,CYB
Alexey Valeryevich MININ,30.07.2020,CYB
Aleksei Yurievich KRIVORUCHKO,15.10.2020,CHEM
Viktor Pavlovych PSHONKA,05.03.2019,UKR
Oleg Mikhaylovich SOTNIKOV,30.07.2020,CYB
Oleksandr Viktorovych YANUKOVYCH,05.03.2019,UKR
Serhiy Vitaliyovych KURCHENKO,05.03.2019,UKR
Igor Olegovich KOSTYUKOV,22.10.2020,CYB
Sergei Vladilenovich KIRIYENKO,15.10.2020,CHEM
Alexander Yevgeniyevich Mishkin,21.01.2019,CHEM
Andrei Veniaminovich YARIN,15.10.2020,CHEM
Alexandr Ivanovich BASTRYKIN,02.03.2021,HR
Viktor Vasiljevitj ZOLOTOV,07.12.2021,HR
Abuzaid Dzhandarovich VISMURADOV,07.12.2021,HR
    `.trim()} />
  <ChartLegend>Die Tabelle zeigt Personen und Organisationen, die auf der Sanktionsliste der EU, aber nicht auf der Seco-Liste auftauchen. Die Abkürzungen in der Spalte «Programm» beziehen sich auf unterschiedliche Sanktionsprogramme der EU. CYB: Cyberangriffe. CHEM: Chemische Waffen. HR: Menschenrechte. UKR: Ukraine. Quelle: OpenSanctions.</ChartLegend>
</div>
```

## Balkengrafik als Tabellenzeile

```react
<div>
  <ChartTitle>Preisgelder E-Sports</ChartTitle>
  <CsvChart
    t={t}
    config={{
  "type": "Table",
  "numberFormat": ".2s",
  "tableColumns": [
    {
      "column": "Jahr",
      "type": "string",
      "width": "50"
    },
    {
      "column": "Spiel",
      "type": "string"
    },
    {
      "column": "Preisgeld",
      "type": "bar",
      "color": true,
      "width": "175"
    }
  ],
  "defaultSortColumn": "Preisgeld",
  "colorMap": {
    "Preisgeld": "#1f77b4"
    },
}}
    values={`
Jahr,Spiel,Preisgeld
1998,Quake II,66200
1999,StarCraft: Brood War,139554
2000,Quake III Arena,415238
2001,Counter-Strike,346592
2002,Counter-Strike,400995
2003,Counter-Strike,821958
2004,Counter-Strike,902652
2005,Counter-Strike,1354441
2006,Counter-Strike,2138623
2007,Counter-Strike,1636886
2008,Counter-Strike,1681708
2009,Counter-Strike,1354653
2010,Counter-Strike,1453214
2011,StarCraft II,3192864
2012,League of Legends,4287209
2013,League of Legends,6226260
2014,Dota 2,16608031
2015,Dota 2,31050787
2016,Dota 2,37464420
2017,Dota 2,38074599
2018,Dota 2,41457369
2019,Fortnite,72800079
2020,Counter-Strike: Global Offensive,15943486
2021,Dota 2,47730561
    `.trim()} />
  <ChartLegend></ChartLegend>
</div>
```
