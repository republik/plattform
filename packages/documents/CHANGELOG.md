<a name="2.7.0"></a>
# 2.7.0 (2018-01-16)



<a name="2.6.0"></a>
# 2.6.0 (2018-01-16)



<a name="2.6.0"></a>
# 2.6.0 (2018-01-16)


### Bug Fixes

* **documents:** mailto links in document resolver (getRepoId) ([e1fd060](https://github.com/orbiting/backend-modules/commit/e1fd060))


### Features

* **documents:** suffix resolved links with an optional querystring ([0cba6dd](https://github.com/orbiting/backend-modules/commit/0cba6dd))



<a name="2.5.6"></a>
## 2.5.6 (2018-01-14)


### Bug Fixes

* **interdependencies:** bump auth ([99614fd](https://github.com/orbiting/backend-modules/commit/99614fd))



<a name="2.5.5"></a>
## 2.5.5 (2018-01-14)


### Bug Fixes

* **documents:** typo ([1be34ac](https://github.com/orbiting/backend-modules/commit/1be34ac))



<a name="2.5.4"></a>
## 2.5.4 (2018-01-14)


### Bug Fixes

* **documents:** user.documents return empty connection instead of null ([5f66bf0](https://github.com/orbiting/backend-modules/commit/5f66bf0))



<a name="2.5.3"></a>
## 2.5.3 (2018-01-14)


### Bug Fixes

* **interdependencies:** bump ([3c22b0c](https://github.com/orbiting/backend-modules/commit/3c22b0c))



<a name="2.5.2"></a>
## 2.5.2 (2018-01-14)


### Bug Fixes

* **interdependencies:** bump interdependencies ([244fba4](https://github.com/orbiting/backend-modules/commit/244fba4))



<a name="2.5.1"></a>
## 2.5.1 (2018-01-14)


### Bug Fixes

* **documents:** undefined param ([23b238c](https://github.com/orbiting/backend-modules/commit/23b238c))



<a name="2.5.0"></a>
# 2.5.0 (2018-01-14)


### Features

* **documents:** urlPrefix args (internal only) for Document.meta and content resolvers ([404f3b8](https://github.com/orbiting/backend-modules/commit/404f3b8))



<a name="2.4.7"></a>
## 2.4.7 (2018-01-14)


### Bug Fixes

* **documents:** hasNextPage off by one ([7a20784](https://github.com/orbiting/backend-modules/commit/7a20784))



<a name="2.4.6"></a>
## 2.4.6 (2018-01-13)


### Bug Fixes

* **documents:** bump backend-modules-auth ([73a63da](https://github.com/orbiting/backend-modules/commit/73a63da))



<a name="2.4.5"></a>
## 2.4.5 (2018-01-13)


### Bug Fixes

* **interdependencies:** dump auth ([932eb2f](https://github.com/orbiting/backend-modules/commit/932eb2f))



<a name="2.4.4"></a>
## 2.4.4 (2018-01-12)


### Bug Fixes

* **interdependencies:** bump auth ([08ed14c](https://github.com/orbiting/backend-modules/commit/08ed14c))



<a name="2.4.3"></a>
## 2.4.3 (2018-01-11)


### Bug Fixes

* **interdependencies:** bump auth ([49e5b1d](https://github.com/orbiting/backend-modules/commit/49e5b1d))



<a name="2.4.2"></a>
## 2.4.2 (2018-01-11)


### Bug Fixes

* **interdependencies:** bump interdependencies ([50e3a30](https://github.com/orbiting/backend-modules/commit/50e3a30))



<a name="2.4.1"></a>
## 2.4.1 (2018-01-09)


### Bug Fixes

* **interdependencies:** bump backend-modules-auth ([4a9d8ca](https://github.com/orbiting/backend-modules/commit/4a9d8ca))



<a name="2.4.0"></a>
# 2.4.0 (2018-01-09)


### Features

* **Resolve:** format url for teaser zones ([b7e395f](https://github.com/orbiting/backend-modules/commit/b7e395f))



<a name="2.3.0"></a>
# 2.3.0 (2018-01-08)



<a name="2.2.0"></a>
# 2.2.0 (2018-01-08)


### Bug Fixes

* **documents:** bump styleguide and it's peerDependencies ([3ec8378](https://github.com/orbiting/backend-modules/commit/3ec8378))


### Features

* **document.resolve:** export getRepoId ([39e347e](https://github.com/orbiting/backend-modules/commit/39e347e))
* **document/-s:** support repoId arg ([351465a](https://github.com/orbiting/backend-modules/commit/351465a))
* **documents:** add lib html which takes a doc and renders it to html ([d1b6931](https://github.com/orbiting/backend-modules/commit/d1b6931))
* **documents:** document resolvers log unresolvable repoIds to errors array ([e941f8b](https://github.com/orbiting/backend-modules/commit/e941f8b))



<a name="2.1.0"></a>
# 2.1.0 (2018-01-07)


### Features

* **documents:** expose (resolved) document and documentId on document.meta ([387a0d6](https://github.com/orbiting/backend-modules/commit/387a0d6))



<a name="2.0.0"></a>
# 2.0.0 (2018-01-03)


### Bug Fixes

* **documents:** adapt document linkedDoc to path ([4212183](https://github.com/orbiting/backend-modules/commit/4212183))


### Features

* **documents:** rename slug to path ([38f8788](https://github.com/orbiting/backend-modules/commit/38f8788))


### BREAKING CHANGES

* **documents:** query document



<a name="1.1.2"></a>
## 1.1.2 (2017-12-29)


### Bug Fixes

* **DocumentMeta:** add path ([6f89db7](https://github.com/orbiting/backend-modules/commit/6f89db7))
* **interdependencies:** bump interdependencies ([4eebee9](https://github.com/orbiting/backend-modules/commit/4eebee9))



<a name="1.1.1"></a>
## 1.1.1 (2017-12-28)


### Bug Fixes

* **documents:** filter userIds with isUUID.v4 ([a423cb3](https://github.com/orbiting/backend-modules/commit/a423cb3))



<a name="1.1.0"></a>
# 1.1.0 (2017-12-26)


### Bug Fixes

* **Document:** pass whole context along (was missing pgdb) ([01af43e](https://github.com/orbiting/backend-modules/commit/01af43e))


### Features

* **Document:** link resolver (gh url to republik path), filters and meta data for dossiers and form ([630cb27](https://github.com/orbiting/backend-modules/commit/630cb27))
* **Document:** resolve user ids to usernames ([1f83fe4](https://github.com/orbiting/backend-modules/commit/1f83fe4))



<a name="1.0.2"></a>
## 1.0.2 (2017-12-21)


### Bug Fixes

* **backend-modules-documents:** bump backend-modules-auth ([ad0a7a5](https://github.com/orbiting/backend-modules/commit/ad0a7a5))



<a name="1.0.1"></a>
## 1.0.1 (2017-12-20)


### Bug Fixes

* **interdependencies:** bump backend-modules-auth ([c7be2b3](https://github.com/orbiting/backend-modules/commit/c7be2b3))



<a name="1.0.0"></a>
# 1.0.0 (2017-12-20)


### Bug Fixes

* **Documents:** filter out empty redis values ([0db3770](https://github.com/orbiting/backend-modules/commit/0db3770))


### Features

* **Documents:** pagination ([3ebf82b](https://github.com/orbiting/backend-modules/commit/3ebf82b))
* **User:** get documents ([f327fcc](https://github.com/orbiting/backend-modules/commit/f327fcc))


### BREAKING CHANGES

* **Documents:** documents endpoints now return a DocumentConnection instead of an array of Documents



<a name="0.3.0"></a>
# 0.3.0 (2017-12-12)


### Features

* **documents:** feed filter ([3a24071](https://github.com/orbiting/backend-modules/commit/3a24071))



<a name="0.2.1"></a>
## 0.2.1 (2017-12-05)


### Bug Fixes

* **dependencies:** bump backend-modules-auth ([090987b](https://github.com/orbiting/backend-modules/commit/090987b))



<a name="0.2.0"></a>
# 0.2.0 (2017-12-04)


### Features

* **backend-modules-documents:** restrict access to documents with ENV var DOCUMENTS_RESTRICT_TO_ROL ([e8621aa](https://github.com/orbiting/backend-modules/commit/e8621aa))



<a name="0.1.0"></a>
# 0.1.0 (2017-11-30)


### Features

* **backend-modules-documents:** expose document.meta kind, format and credits ([5678930](https://github.com/orbiting/backend-modules/commit/5678930))



<a name="0.0.5"></a>
## 0.0.5 (2017-11-27)


### Bug Fixes

* **interdependencies:** bump interdependencies ([cf6e8a5](https://github.com/orbiting/backend-modules/commit/cf6e8a5))



<a name="0.0.4"></a>
## 0.0.4 (2017-11-25)


### Bug Fixes

* **interdependencies:** bump interdependencies ([4803153](https://github.com/orbiting/backend-modules/commit/4803153))



<a name="0.0.3"></a>
## 0.0.3 (2017-11-23)


### Bug Fixes

* **interdependencies:** bump backend-modules-auth in -base and -documents ([d9c9be9](https://github.com/orbiting/backend-modules/commit/d9c9be9))



<a name="0.0.2"></a>
## 0.0.2 (2017-11-22)


### Bug Fixes

* **setup:** bump interdependency versions ([1cca039](https://github.com/orbiting/backend-modules/commit/1cca039))



<a name="0.0.1"></a>
## 0.0.1 (2017-11-22)


### Bug Fixes

* **backend-modules-documents:** fix require scope ([07604c2](https://github.com/orbiting/backend-modules/commit/07604c2))
* **setup:** fix inter-dependencies versions ([183a6aa](https://github.com/orbiting/backend-modules/commit/183a6aa))



<a name="1.0.0"></a>
# 1.0.0 (2017-11-22)


### Bug Fixes

* **setup:** publishConfig access public for all packages ([d0a7504](https://github.com/orbiting/backend-modules/commit/d0a7504))



