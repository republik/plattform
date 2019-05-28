module.exports = {
  getName: ({ firstName, lastName }) =>
    [firstName, lastName]
      .filter(Boolean)
      .join(' ')
      .trim(),

  getInitials: (name) => name
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .map(p => `${p.toUpperCase()}.`)
    .join(' ')
}
