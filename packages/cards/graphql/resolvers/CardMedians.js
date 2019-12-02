const d3 = require('d3')

module.exports = {
  smartspider (nodes) {
    const values = [[], [], [], [], [], [], [], []]

    nodes.forEach(card => {
      if (card.payload.smartvoteCleavage) {
        Array.from(Array(8).keys()).forEach((_, index) => {
          values[index].push(card.payload.smartvoteCleavage[index])
        })
      }
    })

    const medians = values
      .map(values => d3.median(values))
      .map(value => value ? +(value).toFixed(2) : value)

    return medians.filter(Boolean).length > 0 ? medians : null
  }
}
