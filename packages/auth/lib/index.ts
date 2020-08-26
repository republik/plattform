import transfromUser = require('./transformUser')

export default {
  challenges: require('./challenges'),
  AccessToken: require('./AccessToken'),
  AuthError: require('./AuthError'),
  checkUsername: require('./checkUsername'),
  Consents: require('./Consents'),
  ensureSignedIn: require('./ensureSignedIn'),
  ensureUser: require('./ensureUser'),
  Fields: require('./Fields'),
  geoForIP: require('./geoForIP'),
  Roles: require('./Roles'),
  Sessions: require('./Sessions'),
  t: require('./t'),
  transformUser: transfromUser,
  useragent: require('./useragent'),
  Users: require('./Users')
}
