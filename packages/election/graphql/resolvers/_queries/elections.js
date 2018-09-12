module.exports = async (_, args, context) => {
  return [
    {
      id: '38ea97e0-b6a0-11e8-9c04-784f4383ef45',
      slug: 'gen18-members',
      description: 'Wahl in den Genossenschaftsrat',
      beginDate: new Date('2018-10-17T00:00:00.000Z'),
      endDate: new Date('2018-10-31T00:00:00.000Z'),
      numSeats: 30,
      candidates: []
    },
    {
      id: 'edab04f2-b6a1-11e8-93e3-784f4383ef45',
      slug: 'gen18-president',
      description: 'Wahl des Präsidiums des Genossenschaftsrats',
      beginDate: new Date('2018-10-17T00:00:00.000Z'),
      endDate: new Date('2018-10-31T00:00:00.000Z'),
      numSeats: 5,
      candidates: []
    }
  ]
}
