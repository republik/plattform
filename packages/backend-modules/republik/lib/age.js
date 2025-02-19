
exports.age = (birthyear) => {
  const currentYear = new Date().getFullYear()
  const approxAge = currentYear - birthyear
  return approxAge < 0 ? -1 : approxAge
}
