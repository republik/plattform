export default (...args) => {
  try {
    console.warn(...args)
  } catch (e) {}
}
