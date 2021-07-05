export const data = {
  data: {
    search: {
      totalCount: 298,
      pageInfo: {
        hasNextPage: true,
        endCursor:
          'eyJmaWx0ZXJzIjpbeyJrZXkiOiJ0eXBlIiwidmFsdWUiOiJEb2N1bWVudFpvbmUifSx7ImtleSI6ImRvY3VtZW50Wm9uZUlkZW50aWZpZXIiLCJ2YWx1ZSI6IkNIQVJUIn0seyJrZXkiOiJkb2N1bWVudFpvbmVEYXRhVHlwZSIsInZhbHVlIjoiQmFyIn1dLCJzb3J0Ijp7ImtleSI6InB1Ymxpc2hlZEF0IiwiZGlyZWN0aW9uIjoiREVTQyJ9LCJmaXJzdCI6MTAsImZyb20iOjEwfQ=='
      },
      nodes: [
        {
          entity: {
            id:
              'cmVwdWJsaWsvYXJ0aWNsZS1uZXR6ZS1zdGF0dC10YW5rcy9hMDg4ODhkYzgzZGE5ZmYwNmRkNTczYTBkNThkZTViMg==',
            data: {
              showBarValues: true,
              color: 'type',
              colorRange: [
                '#7f7f7f',
                '#8c564b',
                '#2ca02c',
                '#1f77b4',
                '#bcbd22',
                '#ff7f0e',
                '#cccccc',
                '#cda9a2'
              ],
              columns: 2,
              column: 'year',
              sort: 'none',
              type: 'Bar',
              colorSort: 'none',
              columnSort: 'none',
              numberFormat: '.0%',
              domain: [0, 0.63],
              y: 'type',
              minInnerWidth: 125
            },
            node: {
              identifier: 'CHART',
              data: {
                showBarValues: true,
                color: 'type',
                colorRange: [
                  '#7f7f7f',
                  '#8c564b',
                  '#2ca02c',
                  '#1f77b4',
                  '#bcbd22',
                  '#ff7f0e',
                  '#cccccc',
                  '#cda9a2'
                ],
                columns: 2,
                column: 'year',
                sort: 'none',
                type: 'Bar',
                colorSort: 'none',
                columnSort: 'none',
                numberFormat: '.0%',
                domain: [0, 0.63],
                y: 'type',
                minInnerWidth: 125
              },
              children: [
                {
                  depth: 3,
                  children: [
                    {
                      type: 'text',
                      value: 'Komplette Umstellung'
                    }
                  ],
                  type: 'heading'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Anteile an der Wärmeversorgung in St. Gallen'
                    }
                  ],
                  type: 'paragraph'
                },
                {
                  type: 'code',
                  lang: null,
                  value:
                    'year,type,value\n2018,Erdgas,0.42\n2018,Heizöl,0.35\n2018,Fernwärme,0.12\n2018,Wärmepumpe,0.08\n2018,Holz,0.02\n2018,Elektrizität,0.01\n2050,"Biogas, Wärme-Kraft-Kopplungsanlagen",0.2\n2050,Biodiesel,0.02\n2050,Fernwärme,0.51\n2050,Wärmepumpe,0.22\n2050,Holz,0.05'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Quelle: St. Galler Stadtwerke'
                    }
                  ],
                  type: 'paragraph'
                }
              ],
              type: 'zone'
            },
            document: {
              id:
                'cmVwdWJsaWsvYXJ0aWNsZS1uZXR6ZS1zdGF0dC10YW5rcy8yZjdlNjk4NS00YzZhLTRjNjQtYjMwYS1jN2UzOWMzNGVmNjUvdjI=',
              meta: {
                title: 'Wie uns in Zukunft heiss und kalt wird',
                path: '/2021/06/25/wie-uns-in-zukunft-heiss-und-kalt-wird'
              }
            }
          }
        },
        {
          entity: {
            id:
              'cmVwdWJsaWsvYXJ0aWNsZS13YXJ1bS1kYXMtbGFuZC1uZWluLXNhZ3RlLzI0YmY3YTkwOWU0N2M3NGQwMmFkYzk2NjkwNDkyZmQ2',
            data: {
              numberFormat: '%',
              columns: 2,
              domain: [0, 1],
              column: 'cat',
              y: 'label',
              sort: 'none',
              type: 'Bar'
            },
            node: {
              identifier: 'CHART',
              data: {
                numberFormat: '%',
                columns: 2,
                domain: [0, 1],
                column: 'cat',
                y: 'label',
                sort: 'none',
                type: 'Bar'
              },
              children: [
                {
                  depth: 3,
                  children: [
                    {
                      type: 'text',
                      value: 'Städtische Gemeinden sagten eher Ja'
                    }
                  ],
                  type: 'heading'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Stimmenanteil'
                    }
                  ],
                  type: 'paragraph'
                },
                {
                  type: 'code',
                  lang: null,
                  value:
                    'label,value,cat\nKernstadt,0.647,Ganze Schweiz\nIntermediär,0.428,Ganze Schweiz\nLändlich,0.362,Ganze Schweiz\nAarau,0.651,Beispiel im Aargau,\nSchöftland,0.377,Beispiel im Aargau\nSchlossrued,0.275,Beispiel im Aargau'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value:
                        'Eine vierte, schweizweite Kategorie ist der «übrige städtische Raum». Dort stimmten 48,9 Prozent für das Gesetz. Quelle: '
                    },
                    {
                      children: [
                        {
                          type: 'text',
                          value: 'Bundesamt für Statistik'
                        }
                      ],
                      type: 'link',
                      title: null,
                      url:
                        'https://www.bfs.admin.ch/bfs/de/home/statistiken/politik/abstimmungen/jahr-2021/2021-06-13/co2-gesetz.html'
                    }
                  ],
                  type: 'paragraph'
                }
              ],
              type: 'zone'
            },
            document: {
              id:
                'cmVwdWJsaWsvYXJ0aWNsZS13YXJ1bS1kYXMtbGFuZC1uZWluLXNhZ3RlLzgyY2FhNjVjLTBhNzYtNDBlMy04YTIyLWZkYWZmZWZlNTkzYi92NA==',
              meta: {
                title: 'Mein Haus ist mein Schloss',
                path: '/2021/06/21/mein-haus-ist-mein-schloss'
              }
            }
          }
        },
        {
          entity: {
            id:
              'cmVwdWJsaWsvYXJ0aWNsZS1maXNjaHhwZWRpdGlvbmVuLWRlcy1uYWNocmljaHRlbmRpZW5zdHMvYzhkNWRiZDViZTM3YThhMzgyNjE5NzFkNjc1NDJkOGQ=',
            data: {
              showBarValues: true,
              colorRange: ['#009FE3'],
              y: 'year',
              sort: 'none',
              type: 'Bar'
            },
            node: {
              identifier: 'CHART',
              data: {
                showBarValues: true,
                colorRange: ['#009FE3'],
                y: 'year',
                sort: 'none',
                type: 'Bar'
              },
              children: [
                {
                  depth: 3,
                  children: [
                    {
                      type: 'text',
                      value: 'So viele Anfragen wie noch nie'
                    }
                  ],
                  type: 'heading'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Anzahl «einfacher» Auskünfte des ÜPF'
                    }
                  ],
                  type: 'paragraph'
                },
                {
                  type: 'code',
                  lang: null,
                  value:
                    'year,value\n2016,202052\n2017,172186\n2018,153981\n2019,123505\n2020,255467'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Quelle: '
                    },
                    {
                      children: [
                        {
                          type: 'text',
                          value: 'ÜPF'
                        }
                      ],
                      type: 'link',
                      title: null,
                      url: 'https://www.li.admin.ch/de/stats'
                    },
                    {
                      type: 'text',
                      value: '.'
                    }
                  ],
                  type: 'paragraph'
                }
              ],
              type: 'zone'
            },
            document: {
              id:
                'cmVwdWJsaWsvYXJ0aWNsZS1maXNjaHhwZWRpdGlvbmVuLWRlcy1uYWNocmljaHRlbmRpZW5zdHMvOTA4NmMyMTAtNTdkYS00MWVkLWI2YzQtYjRiMTc1NDkwMDk5L3Y1',
              meta: {
                title: 'Fischzüge des Überwachungs­staats',
                path: '/2021/05/26/fischzuege-des-ueberwachungs-staats'
              }
            }
          }
        },
        {
          entity: {
            id:
              'cmVwdWJsaWsvYXJ0aWNsZS1lY2hvLTYvMDcxZDMzY2QwYWZmYTNhNjQ2YjE4OWQwMzVmODBhMGM=',
            data: {
              showBarValues: true,
              color: 'name',
              columns: 2,
              column: 'category',
              xTicks: [0, 25, 50, 75, 100],
              y: 'name',
              sort: 'descending',
              type: 'Bar',
              minInnerWidth: 125,
              colorMap: {
                Minimum: 'rgb(239,69,51)',
                '25% aller Marken über': 'rgb(8,48,107)',
                '75% aller Marken über': 'rgb(75,151,201)',
                'republik.ch': '#000',
                '50% aller Marken über': 'rgb(24,100,170)'
              }
            },
            node: {
              identifier: 'CHART',
              data: {
                showBarValues: true,
                color: 'name',
                columns: 2,
                column: 'category',
                xTicks: [0, 25, 50, 75, 100],
                y: 'name',
                sort: 'descending',
                type: 'Bar',
                minInnerWidth: 125,
                colorMap: {
                  Minimum: 'rgb(239,69,51)',
                  '25% aller Marken über': 'rgb(8,48,107)',
                  '75% aller Marken über': 'rgb(75,151,201)',
                  'republik.ch': '#000',
                  '50% aller Marken über': 'rgb(24,100,170)'
                }
              },
              children: [
                {
                  depth: 3,
                  children: [
                    {
                      type: 'text',
                      value: 'Schweizer Markenleistungs-Top-20'
                    }
                  ],
                  type: 'heading'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Indexwerte (0 bis 100)'
                    }
                  ],
                  type: 'paragraph'
                },
                {
                  type: 'code',
                  lang: null,
                  value:
                    'category,name,value\nGlaubwürdigkeit,Radio SRF 4 News,86\nGlaubwürdigkeit,Le Temps,86\nGlaubwürdigkeit,La Première,85\nGlaubwürdigkeit,Radio SRF 1,85\nGlaubwürdigkeit,Neue Zürcher Zeitung,85\nGlaubwürdigkeit,La Liberté,84\nGlaubwürdigkeit,RTS Un,84\nGlaubwürdigkeit,Radio SRF zwei Kultur,84\nGlaubwürdigkeit,Thuner Tagblatt,83\nGlaubwürdigkeit,SRF 1,83\nGlaubwürdigkeit,Der Bund,83\nGlaubwürdigkeit,NZZ am Sonntag,82\nGlaubwürdigkeit,republik.ch,82\nGlaubwürdigkeit,Bote der Urschweiz,82\nGlaubwürdigkeit,Zuger Zeitung,82\nGlaubwürdigkeit,Espace 2,82\nGlaubwürdigkeit,RSI LA 1,82\nGlaubwürdigkeit,Rete Uno,81\nGlaubwürdigkeit,srf.ch,81\nGlaubwürdigkeit,rts.ch,81\nKompetenz,Radio SRF 4 News,87\nKompetenz,Neue Zürcher Zeitung,87\nKompetenz,Le Temps,86\nKompetenz,La Première,86\nKompetenz,Radio SRF 1,84\nKompetenz,Radio SRF zwei Kultur,84\nKompetenz,RTS Un,84\nKompetenz,SRF 1,83\nKompetenz,NZZ am Sonntag,83\nKompetenz,Handelszeitung,83\nKompetenz,Finanz und Wirtschaft,82\nKompetenz,Rete Due,82\nKompetenz,republik.ch,82\nKompetenz,RSI LA 1,82\nKompetenz,La Liberté,82\nKompetenz,rts.ch,82\nKompetenz,Rete Uno,81\nKompetenz,Der Bund,81\nKompetenz,Espace 2,81\nKompetenz,Thuner Tagblatt,81\nRelevanz,Radio SRF 4 News,88\nRelevanz,Neue Zürcher Zeitung,86\nRelevanz,Radio SRF 1,86\nRelevanz,La Première,85\nRelevanz,SRF 1,85\nRelevanz,Rete Uno,84\nRelevanz,RTS Un,84\nRelevanz,RSI LA 1,83\nRelevanz,Der Bund,83\nRelevanz,Thuner Tagblatt,82\nRelevanz,rts.ch,82\nRelevanz,rsi.ch,81\nRelevanz,La Liberté,81\nRelevanz,Walliser Bote,81\nRelevanz,Le Temps,81\nRelevanz,srf.ch,81\nRelevanz,NZZ am Sonntag,81\nRelevanz,St. Galler Tagblatt,81\nRelevanz,Corriere del Ticino,81\nRelevanz,ARD,80\nSympathie,republik.ch,83\nSympathie,Radio Rottu,82\nSympathie,RadioFr.,82\nSympathie,Thuner Tagblatt,82\nSympathie,La Côte,82\nSympathie,Berner Oberländer,81\nSympathie,Walliser Bote,81\nSympathie,RTS Un,81\nSympathie,Nostalgie,80\nSympathie,Radio SRF zwei Kultur,80\nSympathie,Rete Tre,80\nSympathie,radio3i,80\nSympathie,La Liberté,80\nSympathie,Radio SRF 4 News,80\nSympathie,Der Bund,80\nSympathie,WOZ Die Wochenzeitung,80\nSympathie,La Première,79\nSympathie,Radio SRF 1,79\nSympathie,Zentralschweiz am Sonntag,79\nSympathie,SRF 1,79'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Quelle: '
                    },
                    {
                      children: [
                        {
                          type: 'text',
                          value: 'Publicom 2019'
                        }
                      ],
                      type: 'link',
                      title: 'PDF, siehe Seite 74',
                      url:
                        'https://www.publicom.ch/wp-content/uploads/MMS18_Jahresbericht.pdf'
                    },
                    {
                      type: 'text',
                      value: '; Basis: 176 Medienmarken (N = 31 bis 3843)'
                    }
                  ],
                  type: 'paragraph'
                }
              ],
              type: 'zone'
            },
            document: {
              id:
                'cmVwdWJsaWsvYXJ0aWNsZS1lY2hvLTYvZGM4N2NkZTYtOTY4MS00ZDYzLTgyMDgtNzgxOTUxMjA3YWUyL3YxMg==',
              meta: {
                title:
                  'Ein Interview geht um die Welt, die Republik in den Top 20 und eine Nachlese zum Fall ETH',
                path: '/2020/02/07/echo'
              }
            }
          }
        },
        {
          entity: {
            id:
              'cmVwdWJsaWsvYXJ0aWNsZS13ZWxjaGVuLWZpcm1lbi1nZWhvZXJ0LXp1ZXJpY2gvZDEzZTY1MGNhMjczMTk5NTAxZWVkZDBhYzNmMTg2NzE=',
            data: {
              colorLegend: true,
              showBarValues: true,
              size: 'narrow',
              color: 'category',
              colorRange: ['#ff3300', '#ff9933'],
              y: 'name',
              sort: 'none',
              type: 'Bar'
            },
            node: {
              identifier: 'CHART',
              data: {
                colorLegend: true,
                showBarValues: true,
                size: 'narrow',
                color: 'category',
                colorRange: ['#ff3300', '#ff9933'],
                y: 'name',
                sort: 'none',
                type: 'Bar'
              },
              children: [
                {
                  depth: 3,
                  children: [
                    {
                      type: 'text',
                      value: 'Drei Firmen überragen das Feld'
                    }
                  ],
                  type: 'heading'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Wohnungen im Besitz der zehn grössten Investoren'
                    }
                  ],
                  type: 'paragraph'
                },
                {
                  type: 'code',
                  lang: null,
                  value:
                    'name,category,value\nSwiss Life,Stand 2006,2300\nUBS,Stand 2006,2977\nCredit Suisse,Stand 2006,1716\nAXA,Stand 2006,666\nZurich*,Stand 2006,1377\nBVK-Pensionskasse,Stand 2006,1004\nMigros-Pensionskasse,Stand 2006,971\nPensimo,Stand 2006,1021\nSBB*,Stand 2006,1000\nAgensa*,Stand 2006,847\nSwiss Life,Zunahme 2006 bis 2020,2700\nUBS,Zunahme 2006 bis 2020,721\nCredit Suisse,Zunahme 2006 bis 2020,675\nAXA,Zunahme 2006 bis 2020,934\nBVK-Pensionskasse,Zunahme 2006 bis 2020,363\nMigros-Pensionskasse,Zunahme 2006 bis 2020,354\nPensimo,Zunahme 2006 bis 2020,203'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: '*'
                    },
                    {
                      type: 'text',
                      value:
                        ' Die Zurich-Versicherung besass 2006 mehr Immobilien als heute. Bei den SBB und Agensa ist der Stand von 2006 nicht bekannt. Die SBB besitzt laut eigenen Angaben «rund 1000 Objekte, die derzeit in Betrieb sind oder innerhalb der nächsten sechs Monate in Betrieb genommen werden». Quelle: Angaben der Unternehmen'
                    }
                  ],
                  type: 'paragraph'
                }
              ],
              type: 'zone'
            },
            document: {
              id:
                'cmVwdWJsaWsvYXJ0aWNsZS13ZWxjaGVuLWZpcm1lbi1nZWhvZXJ0LXp1ZXJpY2gvODYwNWM5NTMtZDUyNi00OWUzLWIzNGUtN2E5ZmI2YmJiNmRjL3Y3',
              meta: {
                title: 'Wie sich Immo-Firmen in Zürich ausbreiten',
                path: '/2021/05/17/wie-sich-immo-firmen-in-zuerich-ausbreiten'
              }
            }
          }
        },
        {
          entity: {
            id:
              'cmVwdWJsaWsvYXJ0aWNsZS1hbmFseXNlLXN0cmFmZ2VyaWNodC9jYTQ5YmI1Zjg4MmI5NmVkNzZmMDVkN2Q4NGY3MWYwMg==',
            data: {
              colorLegend: false,
              inlineLabel: 'Anzahl',
              colorSort: 'none',
              color: 'cat',
              inlineSecondaryLabel: 'label',
              sort: 'none',
              type: 'Bar',
              colorMap: {
                Freigesprochen: 'sequential60',
                Verurteilt: 'opposite60',
                'Rechtskräftig verurteilt': 'opposite80'
              },
              barStyle: 'large',
              inlineValue: true
            },
            node: {
              identifier: 'CHART',
              data: {
                colorLegend: false,
                inlineLabel: 'Anzahl',
                colorSort: 'none',
                color: 'cat',
                inlineSecondaryLabel: 'label',
                sort: 'none',
                type: 'Bar',
                colorMap: {
                  Freigesprochen: 'sequential60',
                  Verurteilt: 'opposite60',
                  'Rechtskräftig verurteilt': 'opposite80'
                },
                barStyle: 'large',
                inlineValue: true
              },
              children: [
                {
                  depth: 3,
                  children: [
                    {
                      type: 'text',
                      value:
                        'Gut die Hälfte der Angeklagten wurde rechtskräftig verurteilt'
                    }
                  ],
                  type: 'heading'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Anzahl der Angeklagten'
                    }
                  ],
                  type: 'paragraph'
                },
                {
                  type: 'code',
                  lang: null,
                  value:
                    'cat,value,range,label, Anzahl\nRechtskräftig verurteilt,15,1,rechtskräftig verurteilt,15\nVerurteilt,6,1, verurteilt,6\nFreigesprochen,8,1, freigesprochen,8'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value:
                        '6 Angeklagte wurden verurteilt, können aber noch in Berufung gehen. Quelle: Ahmed Ajil und Kastriot Lubishtani, «Le terrorisme djihadiste devant le Tribunal pénal fédéral – analyse des procédures pénales de 2004 à 2020». Universität Lausanne, '
                    },
                    {
                      children: [
                        {
                          type: 'text',
                          value: 'unpubliziertes Manuskript'
                        }
                      ],
                      type: 'link',
                      title: null,
                      url:
                        'https://www.researchgate.net/publication/351376908_Analyse_du_terrorisme_djihadiste_devant_le_Tribunal_penal_federal_2004-2020'
                    },
                    {
                      type: 'text',
                      value: '.'
                    }
                  ],
                  type: 'paragraph'
                }
              ],
              type: 'zone'
            },
            document: {
              id:
                'cmVwdWJsaWsvYXJ0aWNsZS1hbmFseXNlLXN0cmFmZ2VyaWNodC8yYTJhYTE2Ny0zZDFmLTRjMzYtYmJiOS1hMjA5ODZjOWQxODgvdjE=',
              meta: {
                title:
                  'Ist unser Rechtsstaat wehrlos gegen Terrorismus? Ein Blick auf die Urteile',
                path:
                  '/2021/05/17/ist-unser-rechtsstaat-wehrlos-gegen-terrorismus-ein-blick-auf-die-urteile'
              }
            }
          }
        },
        {
          entity: {
            id:
              'cmVwdWJsaWsvYXJ0aWNsZS1hbmFseXNlLXN0cmFmZ2VyaWNodC8xYWE5YzhkOTQyYWZjYmQ0MWI0YWZhY2U4NDYwYjFlMw==',
            data: {
              colorLegend: false,
              colorSort: 'none',
              color: 'cat',
              inlineSecondaryLabel: 'label',
              sort: 'none',
              type: 'Bar',
              colorMap: {
                'Physische Handlungen': '#F1C40F',
                'Digitale Handlungen': '#2ECC71'
              },
              barStyle: 'large',
              inlineValue: true
            },
            node: {
              identifier: 'CHART',
              data: {
                colorLegend: false,
                colorSort: 'none',
                color: 'cat',
                inlineSecondaryLabel: 'label',
                sort: 'none',
                type: 'Bar',
                colorMap: {
                  'Physische Handlungen': '#F1C40F',
                  'Digitale Handlungen': '#2ECC71'
                },
                barStyle: 'large',
                inlineValue: true
              },
              children: [
                {
                  depth: 3,
                  children: [
                    {
                      type: 'text',
                      value:
                        'Die meisten Prozesse behandeln digitale Aktivitäten'
                    }
                  ],
                  type: 'heading'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Anzahl der Prozesse'
                    }
                  ],
                  type: 'paragraph'
                },
                {
                  type: 'code',
                  lang: null,
                  value:
                    'cat,value,range,label, Anzahl\ndigitale Handlungen,9,1,digitale Handlungen,9\nphysische Handlungen,6,1, physische Handlungen,6'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value:
                        'Quelle: Ahmed Ajil und Kastriot Lubishtani, «Le terrorisme djihadiste devant le Tribunal pénal fédéral – analyse des procédures pénales de 2004 à 2020». Universität Lausanne, unpubliziertes Manuskript.'
                    }
                  ],
                  type: 'paragraph'
                }
              ],
              type: 'zone'
            },
            document: {
              id:
                'cmVwdWJsaWsvYXJ0aWNsZS1hbmFseXNlLXN0cmFmZ2VyaWNodC8yYTJhYTE2Ny0zZDFmLTRjMzYtYmJiOS1hMjA5ODZjOWQxODgvdjE=',
              meta: {
                title:
                  'Ist unser Rechtsstaat wehrlos gegen Terrorismus? Ein Blick auf die Urteile',
                path:
                  '/2021/05/17/ist-unser-rechtsstaat-wehrlos-gegen-terrorismus-ein-blick-auf-die-urteile'
              }
            }
          }
        },
        {
          entity: {
            id:
              'cmVwdWJsaWsvYXJ0aWNsZS1mb3NzaWxlLXN1YnZlbnRpb25lbi82MjZjNjNmY2EzMGZmMWRmZDc5MjY0MWUxODI3ZWNlOQ==',
            data: {
              colorRange: ['#993404'],
              xTicks: [0, 10000000000, 20000000000, 30000000000, 40000000000],
              y: 'category_short',
              sort: 'descending',
              type: 'Bar'
            },
            node: {
              identifier: 'CHART',
              data: {
                colorRange: ['#993404'],
                xTicks: [0, 10000000000, 20000000000, 30000000000, 40000000000],
                y: 'category_short',
                sort: 'descending',
                type: 'Bar'
              },
              children: [
                {
                  depth: 3,
                  children: [
                    {
                      type: 'text',
                      value: 'Der Autoverkehr profitiert am meisten'
                    }
                  ],
                  type: 'heading'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value:
                        'Subventionen in fossile Energieträger, Summe in Euro'
                    }
                  ],
                  type: 'paragraph'
                },
                {
                  type: 'code',
                  lang: null,
                  value:
                    'category_short,value\nLuftfahrt,29493070000\nEnergieintensive Unternehmen,30656570000\n"Benzin, Diesel, Verbrennungsmotoren",37573270000\nLandwirtschaft,6895130000\n"Kohle-, Öl- und Gasförderung",6046030000\nFossile Stromproduktion,6843350000\nAndere,10340088000\nFossile Heizungen,9273710000'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value:
                        'Quelle: Investigate Europe, OECD, Europäische Kommission, diverse nationale Behörden'
                    }
                  ],
                  type: 'paragraph'
                }
              ],
              type: 'zone'
            },
            document: {
              id:
                'cmVwdWJsaWsvYXJ0aWNsZS1mb3NzaWxlLXN1YnZlbnRpb25lbi81YWY4YzFjNy1lNzRhLTRjNDktYTdlMy1hNzBhYzlmOWZhNWQvdjM=',
              meta: {
                title: 'Wie sich Europa beim Klimaschutz betrügt',
                path: '/2020/07/06/wie-sich-europa-beim-klimaschutz-betruegt'
              }
            }
          }
        },
        {
          entity: {
            id:
              'cmVwdWJsaWsvYXJ0aWNsZS1mb3NzaWxlLXN1YnZlbnRpb25lbi84YjIxOGRjNDYyMTQ1ZGJlZGI2MTgwMzI0ZWJkN2FmOA==',
            data: {
              colorLegend: true,
              showBarValues: false,
              colorSort: 'none',
              numberFormat: '.2s',
              color: 'branche',
              colorRange: ['#662506', '#cc4c02', '#fe9929'],
              xTicks: [0, 20000000, 40000000, 60000000, 80000000],
              y: 'company',
              sort: 'none',
              type: 'Bar'
            },
            node: {
              identifier: 'CHART',
              data: {
                colorLegend: true,
                showBarValues: false,
                colorSort: 'none',
                numberFormat: '.2s',
                color: 'branche',
                colorRange: ['#662506', '#cc4c02', '#fe9929'],
                xTicks: [0, 20000000, 40000000, 60000000, 80000000],
                y: 'company',
                sort: 'none',
                type: 'Bar'
              },
              children: [
                {
                  depth: 3,
                  children: [
                    {
                      type: 'text',
                      value: 'Stahl-, Zement- und Erdölfirmen profitieren'
                    }
                  ],
                  type: 'heading'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Frei zugeteilte CO'
                    },
                    {
                      children: [
                        {
                          type: 'text',
                          value: '2'
                        }
                      ],
                      type: 'sub'
                    },
                    {
                      type: 'text',
                      value: '-Zertifikate im Emissionshandel'
                    }
                  ],
                  type: 'paragraph'
                },
                {
                  type: 'code',
                  lang: null,
                  value:
                    'company,branche,combined,value\nArcelorMittal,Stahl,ArcelorMittal (Stahl),67800000\nLafargeHolcim,Zement,Lafarge Holcim (Zement),20300000\nHeidelbergCement,Zement,HeidelbergCement (Zement),17400000\nThyssenKrupp Group,Stahl,ThyssenKrupp Group (Stahl),16800000\nTata Group,Stahl,Tata Group (Stahl),16800000\nTotal,Erdöl,Total (Erdöl),15100000\nExxonMobil,Erdöl,ExxonMobil (Erdöl),11300000\nCRH,Zement,CRH (Zement),10900000\nItalcementi Group,Zement,Italcementi Grup (Zement),10000000\nShell,Erdöl,Shell (Erdöl),9800000'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value:
                        'Ein Zertifikat berechtigt zur Emission von einer Tonne CO'
                    },
                    {
                      children: [
                        {
                          type: 'text',
                          value: '2'
                        }
                      ],
                      type: 'sub'
                    },
                    {
                      type: 'text',
                      value: '. Quelle: Sandbag'
                    }
                  ],
                  type: 'paragraph'
                }
              ],
              type: 'zone'
            },
            document: {
              id:
                'cmVwdWJsaWsvYXJ0aWNsZS1mb3NzaWxlLXN1YnZlbnRpb25lbi81YWY4YzFjNy1lNzRhLTRjNDktYTdlMy1hNzBhYzlmOWZhNWQvdjM=',
              meta: {
                title: 'Wie sich Europa beim Klimaschutz betrügt',
                path: '/2020/07/06/wie-sich-europa-beim-klimaschutz-betruegt'
              }
            }
          }
        },
        {
          entity: {
            id:
              'cmVwdWJsaWsvYXJ0aWNsZS1qZWRlLXdvY2hlLWVpbi1qb3VybmFsaXN0LXdlbmlnZXIvZWJlM2MwNDU0Zjg2NzlmMjYxNTFlMDgxZDI0Zjc1YTg=',
            data: {
              showBarValues: true,
              size: 'narrow',
              domain: [0, 145],
              y: 'category',
              sort: 'none',
              type: 'Bar'
            },
            node: {
              identifier: 'CHART',
              data: {
                showBarValues: true,
                size: 'narrow',
                domain: [0, 145],
                y: 'category',
                sort: 'none',
                type: 'Bar'
              },
              children: [
                {
                  depth: 3,
                  children: [
                    {
                      type: 'text',
                      value: 'Die Seite gewechselt'
                    }
                  ],
                  type: 'heading'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Was die Journalismus-Aussteiger heute machen'
                    }
                  ],
                  type: 'paragraph'
                },
                {
                  type: 'code',
                  lang: null,
                  value:
                    'category,value\nSprecherin,137\nAussteiger,91\nAuftragsschreiberin,55\nBerater,40\nHybrid,35'
                },
                {
                  children: [
                    {
                      type: 'text',
                      value:
                        'Legende: Sprecherin = Kommunikation für Firmen oder Institutionen. Aussteiger = Beschäftigung ausserhalb der Medien­welt, z. B. Hotelier oder Geschäfts­führerin. Auftrags­schreiberin = Texte verfassen für Unter­nehmen oder Organisationen. Berater = PR- oder Kommunikations­beratung. Hybrid = journalistisch tätig mit Einkommen ausserhalb des Journalismus. Quelle: eigene Auswertung.'
                    }
                  ],
                  type: 'paragraph'
                }
              ],
              type: 'zone'
            },
            document: {
              id:
                'cmVwdWJsaWsvYXJ0aWNsZS1qZWRlLXdvY2hlLWVpbi1qb3VybmFsaXN0LXdlbmlnZXIvNzRlNTY2YWYtNTgxNS00NTE2LWE5ODgtYWFlNjUxMTkzZjZkL3Y4',
              meta: {
                title: 'Jede Woche eine Journalistin weniger ',
                path: '/2021/04/29/jede-woche-eine-journalistin-weniger'
              }
            }
          }
        }
      ]
    }
  }
}
