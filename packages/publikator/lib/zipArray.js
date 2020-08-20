module.exports = (array) => {
  let newArray = []
  for (let i = 0; i < array.length; i += 2) {
    newArray.push({
      value: array[i],
      score: parseInt(array[i + 1])
    })
  }
  return newArray
}
