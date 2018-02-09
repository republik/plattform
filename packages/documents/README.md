# @orbiting/backend-modules-documents

graphql schema and resolvers to retrieve mdast-documents from redis.

## ENV
```
# This var restricts the documents query to the specified roles.
# Without it beeing specified, documents are served to everybody.
DOCUMENTS_RESTRICT_TO_ROLES=editor,member
```
