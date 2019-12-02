const { transformName, clipNamesInText } = require('./nameClipper')

test('transformName', () => {
  expect(
    transformName({
      firstName: 'Andrea',
      lastName: 'mate'
    })
  ).toEqual(
    {
      firstName: 'Andrea',
      lastName: 'mate',
      name: 'Andrea mate',
      initials: 'A. M.',
      lastNameShort: 'M'
    }
  )
})

test('clipNamesInText', () => {
  const userNames = [
    { firstName: 'Patrick', lastName: 'Recher' },
    { firstName: 'Andreas', lastName: 'Moor' },
    { firstName: 'Urs', lastName: 'Wys' }
  ]
  const namesToClip = userNames.map(transformName)

  const testStrings = [
    { input: 'Recher',
      expected: 'R.'
    },
    { input: 'Patrick Recher',
      expected: 'P. R.'
    },
    { input: 'Recher,',
      expected: 'R.,'
    },
    { input: 'Recher.',
      expected: 'R.'
    },
    { input: 'Lieber Patrick Recher!',
      expected: 'Lieber P. R.!'
    },
    { input: 'Lieber pAtRiCk ReChEr!',
      expected: 'Lieber P. R.!'
    },
    { input: 'Herr Moor, so nicht!',
      expected: 'Herr M., so nicht!'
    },
    { input: 'Danke Herr Moor.',
      expected: 'Danke Herr M.'
    },
    { input: 'Schluss.\nMoor beweist durchhaltevermögen.',
      expected: 'Schluss.\nM. beweist durchhaltevermögen.'
    },
    { input: 'gute Recherchen brauchen Zeit.',
      expected: 'gute Recherchen brauchen Zeit.'
    },
    { input: 'Wys nicht weiss',
      expected: 'Wys nicht weiss'
    }
  ]

  testStrings.forEach(ts => {
    expect(
      clipNamesInText(namesToClip, ts.input)
    ).toBe(
      ts.expected
    )
  })
})
