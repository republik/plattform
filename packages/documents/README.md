# @orbiting/backend-modules-documents

graphql schema and resolvers to retrieve mdast-documents from redis.

used by:
- [publikator-backend](https://github.com/orbiting/publikator-backend)
- [republik-backend](https://github.com/orbiting/republik-backend)

## ENV
```
# This var restricts the documents query to the specified roles.
# Without it beeing specified, documents are server to everybody.
DOCUMENTS_RESTRICT_TO_ROLES=editor,member
```
