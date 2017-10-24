module.exports = () => new Promise(function (resolve) {
  setTimeout(() => {
    resolve(true)
  }, 2000)
})
