// Live Query:
// {
//   cards {
//     totalCount
//     aggregations(keys:[partyParent]) {
//       key
//       buckets {
//         value
//         cards {
//           totalCount
//           medians {
//             smartspider
//           }
//         }
//       }
//     }
//   }
// }

const labels = {
  GPS: 'Grüne',
}

const data = [
  {
    value: 'SVP',
    cards: {
      totalCount: 581,
      medians: {
        smartspider: [25, 64.1, 59.3, 78.7, 95.8, 28, 27.5, 35.5],
      },
    },
  },
  {
    value: 'SP',
    cards: {
      totalCount: 617,
      medians: {
        smartspider: [67.9, 16.7, 29.4, 13.9, 0, 92.9, 97.5, 88.6],
      },
    },
  },
  {
    value: 'FDP',
    cards: {
      totalCount: 537,
      medians: {
        smartspider: [67.9, 78.6, 52.5, 52.8, 45.8, 47.6, 26.7, 60],
      },
    },
  },
  {
    value: 'CVP',
    cards: {
      totalCount: 742,
      medians: {
        smartspider: [57.1, 41.7, 47.1, 55.6, 33.3, 66.1, 56.7, 55],
      },
    },
  },
  {
    value: 'GPS',
    cards: {
      totalCount: 451,
      medians: {
        smartspider: [60.7, 12.5, 29.4, 13, 0, 98.2, 95, 86.1],
      },
    },
  },
  {
    value: 'GLP',
    cards: {
      totalCount: 478,
      medians: {
        smartspider: [75, 56.8, 44.6, 34.3, 16.7, 89.3, 51.7, 78.3],
      },
    },
  },
  {
    value: 'BDP',
    cards: {
      totalCount: 210,
      medians: {
        smartspider: [60.7, 45.8, 43.1, 52.8, 37.5, 66.05, 52.1, 62.8],
      },
    },
  },
  {
    value: 'EVP',
    cards: {
      totalCount: 306,
      medians: {
        smartspider: [64.3, 33.4, 35.8, 47.2, 29.2, 81.6, 73.3, 45.5],
      },
    },
  },
  {
    value: 'Lega',
    cards: {
      totalCount: 9,
      medians: {
        smartspider: [19.65, 57.3, 58.35, 80.1, 97.9, 30.7, 53.3, 53.35],
      },
    },
  },
  {
    value: 'PdA',
    cards: {
      totalCount: 100,
      medians: {
        smartspider: [53.6, 9.4, 31.9, 9.3, 0, 89.3, 100, 86.7],
      },
    },
  },
  {
    value: 'MCG',
    cards: {
      totalCount: 9,
      medians: {
        smartspider: [21.4, 40.1, 44.6, 77.8, 87.5, 55.9, 64.2, 52.7],
      },
    },
  },
]

data.forEach((d) => {
  d.label = labels[d.value]
  d.smartspider = d.cards.medians.smartspider
})

export default data
