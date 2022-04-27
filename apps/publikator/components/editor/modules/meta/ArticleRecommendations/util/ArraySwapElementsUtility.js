export function swapArrayElements(array, indexA, indexB) {
  const rearrangedArray = [...array]
  const smallIndex = Math.min(indexA, indexB)
  const largeIndex = Math.max(indexA, indexB)

  if (
    array.length < 2 ||
    smallIndex === largeIndex ||
    smallIndex < 0 ||
    largeIndex > rearrangedArray.length - 1
  ) {
    return array
  }

  const a = rearrangedArray[smallIndex]
  const b = rearrangedArray[largeIndex]
  rearrangedArray[smallIndex] = b
  rearrangedArray[largeIndex] = a

  return rearrangedArray
}
