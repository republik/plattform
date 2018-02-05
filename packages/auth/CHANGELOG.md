<a name="3.0.5"></a>
## 3.0.5 (2018-01-16)



<a name="3.0.5"></a>
## 3.0.5 (2018-01-14)


### Bug Fixes

* **auth:** error levels ([3b166c1](https://github.com/orbiting/backend-modules/commit/3b166c1))



<a name="3.0.4"></a>
## 3.0.4 (2018-01-14)


### Bug Fixes

* **interdependencies:** bump ([f49f99d](https://github.com/orbiting/backend-modules/commit/f49f99d))



<a name="3.0.3"></a>
## 3.0.3 (2018-01-14)


### Bug Fixes

* **auth:** user updatedAt is public ([0093c9f](https://github.com/orbiting/backend-modules/commit/0093c9f))



<a name="3.0.2"></a>
## 3.0.2 (2018-01-14)


### Bug Fixes

* **auth:** update translations ([b0b3440](https://github.com/orbiting/backend-modules/commit/b0b3440))



<a name="3.0.1"></a>
## 3.0.1 (2018-01-14)


### Bug Fixes

* **auth:** autologin ([2f10534](https://github.com/orbiting/backend-modules/commit/2f10534))



<a name="3.0.0"></a>
# 3.0.0 (2018-01-13)


### Features

* **auth:** remove confirm token http endpoint, signInHooks from GraphQL context ([a4dfe54](https://github.com/orbiting/backend-modules/commit/a4dfe54))


### BREAKING CHANGES

* **auth:** no more token confirmation via http, GraphQL authorizeSession only



<a name="2.5.4"></a>
## 2.5.4 (2018-01-13)


### Bug Fixes

* **auth:** add missing await for authorizeSession ([f415ee3](https://github.com/orbiting/backend-modules/commit/f415ee3))



<a name="2.5.3"></a>
## 2.5.3 (2018-01-13)


### Bug Fixes

* **auth:** remove mergeUsers (business logic is in republik-backend) ([0529867](https://github.com/orbiting/backend-modules/commit/0529867))



<a name="2.5.2"></a>
## 2.5.2 (2018-01-13)


### Bug Fixes

* **auth:** remove package-lock.json ([7b93b35](https://github.com/orbiting/backend-modules/commit/7b93b35))



<a name="2.5.1"></a>
## 2.5.1 (2018-01-12)


### Bug Fixes

* translations ([8529035](https://github.com/orbiting/backend-modules/commit/8529035))



<a name="2.5.0"></a>
# 2.5.0 (2018-01-11)


### Features

* **auth:** echo query replies useragent, ip, geo ([313957b](https://github.com/orbiting/backend-modules/commit/313957b))



<a name="2.4.1"></a>
## 2.4.1 (2018-01-11)


### Bug Fixes

* **interdependencies:** bump backend-modules-mail ([b440c5f](https://github.com/orbiting/backend-modules/commit/b440c5f))



<a name="2.4.0"></a>
# 2.4.0 (2018-01-11)


### Bug Fixes

* **auth:** down migration for event log ([9f1e30e](https://github.com/orbiting/backend-modules/commit/9f1e30e))
* **authorizeSession:** fix token invalid error message ([9134f65](https://github.com/orbiting/backend-modules/commit/9134f65))


### Features

* **auth:** log all session manipulations to eventLog table ([72d7d5e](https://github.com/orbiting/backend-modules/commit/72d7d5e))
* **auth:** session.isCurrent ([6857f09](https://github.com/orbiting/backend-modules/commit/6857f09))



<a name="2.3.0"></a>
# 2.3.0 (2018-01-09)


### Features

* **signInHooks:** add isNew as second param ([9c79c04](https://github.com/orbiting/backend-modules/commit/9c79c04))



<a name="2.2.3"></a>
## 2.2.3 (2017-12-29)


### Bug Fixes

* **interdependencies:** bump interdependencies ([d94150b](https://github.com/orbiting/backend-modules/commit/d94150b))



<a name="2.2.2"></a>
## 2.2.2 (2017-12-29)


### Bug Fixes

* **dependencies:** bump external deps (namely graphql 0.12.3) ([ea56999](https://github.com/orbiting/backend-modules/commit/ea56999))



<a name="2.2.1"></a>
## 2.2.1 (2017-12-26)


### Bug Fixes

* **Username:** proper German errors ([48588ae](https://github.com/orbiting/backend-modules/commit/48588ae))
* **Username:** restrict to a-z, 0-9 and . ([3a2c22d](https://github.com/orbiting/backend-modules/commit/3a2c22d))



<a name="2.2.0"></a>
# 2.2.0 (2017-12-21)


### Features

* **backend-modules-auth:** add possibility to provide hooks which are called after successful signI ([2ef00cb](https://github.com/orbiting/backend-modules/commit/2ef00cb))



<a name="2.1.0"></a>
# 2.1.0 (2017-12-21)


### Bug Fixes

* **backend-modules-auth:** fix and or logic ([55e316e](https://github.com/orbiting/backend-modules/commit/55e316e))
* **backend-modules-auth:** only allow editors to access user.email ([ea04821](https://github.com/orbiting/backend-modules/commit/ea04821))


### Features

* **backend-modules-auth:** allow admins and supporters to access get user details ([6dd1017](https://github.com/orbiting/backend-modules/commit/6dd1017))
* **backend-modules-auth:** expose user createdAt and updatedAt ([f5d3608](https://github.com/orbiting/backend-modules/commit/f5d3608))



<a name="2.0.0"></a>
# 2.0.0 (2017-12-20)


### Bug Fixes

* **User:** expose email be default and protect with various roles ([d128d84](https://github.com/orbiting/backend-modules/commit/d128d84))
* **User:** more consistent SQL statements ([cf01ae0](https://github.com/orbiting/backend-modules/commit/cf01ae0))
* **User:** only send valid uuids to db ([0c52356](https://github.com/orbiting/backend-modules/commit/0c52356))
* **User:** roles check ([8ab9419](https://github.com/orbiting/backend-modules/commit/8ab9419))
* **User:** use me and not target user for roles check ([a350100](https://github.com/orbiting/backend-modules/commit/a350100))


### Code Refactoring

* **User:** drop gitAuthor ([fc77827](https://github.com/orbiting/backend-modules/commit/fc77827))


### Features

* **User:** add username and public profile flag ([037a99a](https://github.com/orbiting/backend-modules/commit/037a99a))
* **User:** get by slug (id or username) ([01d0c40](https://github.com/orbiting/backend-modules/commit/01d0c40))
* **User:** get documents ([f327fcc](https://github.com/orbiting/backend-modules/commit/f327fcc))
* **User:** hasPublicProfile and initials out of the box ([33d10b0](https://github.com/orbiting/backend-modules/commit/33d10b0))
* **User:** username check ([8888acb](https://github.com/orbiting/backend-modules/commit/8888acb))


### BREAKING CHANGES

* **User:** user.gitAuthor() is no longer available
* **User:** move arbitrary user data to _data



<a name="1.1.0"></a>
# 1.1.0 (2017-12-15)


### Features

* **backend-modules-auth:** param cookieName to express/auth.js configures express session ([f165266](https://github.com/orbiting/backend-modules/commit/f165266))



<a name="1.0.0"></a>
# 1.0.0 (2017-12-05)


### Features

* **backend-modules-auth:** redirect to frontend on /auth, email templates, README ([41a0bde](https://github.com/orbiting/backend-modules/commit/41a0bde))


### BREAKING CHANGES

* **backend-modules-auth:** ENV var FRONTEND_BASE_URL required



<a name="0.7.0"></a>
# 0.7.0 (2017-12-04)


### Bug Fixes

* **backend-modules-auth:** simplify code ([786b1cb](https://github.com/orbiting/backend-modules/commit/786b1cb))


### Features

* **backend-modules-auth:** extend lib/Roles by userIsInRoles and ensureUserIsInRoles ([256e65d](https://github.com/orbiting/backend-modules/commit/256e65d))



<a name="0.6.1"></a>
## 0.6.1 (2017-11-30)


### Bug Fixes

* **backend-modules-auth:** missing dependency rw ([335af04](https://github.com/orbiting/backend-modules/commit/335af04))



<a name="0.6.0"></a>
# 0.6.0 (2017-11-30)


### Features

* **backend-modules-auth:** roleUsers: input via stdin, create users ([c8dc633](https://github.com/orbiting/backend-modules/commit/c8dc633))



<a name="0.5.4"></a>
## 0.5.4 (2017-11-30)


### Bug Fixes

* **backend-modules-auth:** add context param to signIn mutation. deprecated, but crowdfunding-fronte ([a176f24](https://github.com/orbiting/backend-modules/commit/a176f24))



<a name="0.5.3"></a>
## 0.5.3 (2017-11-29)


### Bug Fixes

* **backend-modules-auth:** roleUser db connection ([5a228c6](https://github.com/orbiting/backend-modules/commit/5a228c6))



<a name="0.5.2"></a>
## 0.5.2 (2017-11-28)


### Bug Fixes

* **backend-modules-auth:** seeds.js require pgdb from backend-modules-base ([8c1a92a](https://github.com/orbiting/backend-modules/commit/8c1a92a))



<a name="0.5.1"></a>
## 0.5.1 (2017-11-27)


### Bug Fixes

* **interdependencies:** bump interdependencies ([74ab456](https://github.com/orbiting/backend-modules/commit/74ab456))



<a name="0.5.0"></a>
# 0.5.0 (2017-11-26)


### Features

* **backend-modules-auth:** add lib/ensureSignedIn.js ([662020b](https://github.com/orbiting/backend-modules/commit/662020b))



<a name="0.4.2"></a>
## 0.4.2 (2017-11-26)


### Bug Fixes

* **backend-modules-auth:** rename createUser -> transformUser ([2548b7b](https://github.com/orbiting/backend-modules/commit/2548b7b))



<a name="0.4.1"></a>
## 0.4.1 (2017-11-25)


### Bug Fixes

* **interdependencies:** bump interdependencies ([a6397a7](https://github.com/orbiting/backend-modules/commit/a6397a7))



<a name="0.4.0"></a>
# 0.4.0 (2017-11-25)


### Features

* **backend-modules-auth:** req.user: try to resolve name from email if firstName and lastName are m ([e407050](https://github.com/orbiting/backend-modules/commit/e407050))



<a name="0.3.0"></a>
# 0.3.0 (2017-11-24)


### Features

* **backend-modules-auth:** simple users query ([05e35ad](https://github.com/orbiting/backend-modules/commit/05e35ad))



<a name="0.2.0"></a>
# 0.2.0 (2017-11-23)


### Features

* **backend-modules-auth:** add script/roleUsers to add/remove a role from users ([b9af2ea](https://github.com/orbiting/backend-modules/commit/b9af2ea))



<a name="0.1.0"></a>
# 0.1.0 (2017-11-23)


### Features

* **backend-modules-auth:** release 695e86f6038563ca1571d11993b8146ea77007f8 ([ef96206](https://github.com/orbiting/backend-modules/commit/ef96206))



<a name="0.0.1"></a>
## 0.0.1 (2017-11-22)


### Bug Fixes

* **setup:** fix inter-dependencies versions ([183a6aa](https://github.com/orbiting/backend-modules/commit/183a6aa))



<a name="1.0.0"></a>
# 1.0.0 (2017-11-22)


### Bug Fixes

* **setup:** publishConfig access public for all packages ([d0a7504](https://github.com/orbiting/backend-modules/commit/d0a7504))



