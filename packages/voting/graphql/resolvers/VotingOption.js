module.exports = {
  label ({ name, label }) {
    if (label) {
      return label
    } else {
      return name
    }
  }
}
