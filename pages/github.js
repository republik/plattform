import React, { Component } from 'react'
import withData from '../lib/apollo/withData'
import { Link } from '../server/routes'

import App from '../lib/App'
import Repositories from '../lib/github/components/Repository/List'
import Branches from '../lib/github/components/Branch/List'
import Tree from '../lib/github/components/Tree/List'
import Commits from '../lib/github/components/Commit/List'
import Editor from '../lib/github/components/Editor'

export default withData(({ url: { query: { organization, repo, path, edit, create } } }) => {
  const _path = path && decodeURIComponent(path)
  const pathIsTree = _path && _path.indexOf(':') > -1
  return (
    <App>
      {!repo &&
        <div>
          <h2>{organization}/</h2>
          <small>Repositories:</small>
          <Repositories
            organization={organization} />
        </div>
      }
      {repo && !_path &&
        <div>
          <h2>{organization}/{repo}</h2>
          <small>Branches:</small>
          <Branches
            organization={organization}
            repo={repo} />
        </div>
      }
      {_path && pathIsTree && !edit && !create &&
        <div>
          <h2>{organization}/{repo}/{_path}</h2>
          <small>Tree:</small>
          <Tree
            organization={organization}
            repo={repo}
            path={_path} />

          <div>
            <br />
            <Link
              route="github"
              params={{
                organization,
                repo,
                path: _path.split(':')[0]
              }}
            >
              <a>
                show history
              </a>
            </Link>
          </div>
        </div>
      }
      {_path && !pathIsTree && !edit && !create &&
        <div>
          <h2>{organization}/{repo}/{_path}</h2>
          <small>Commits:</small>
          <Commits
            organization={organization}
            repo={repo}
            path={_path} />
        </div>
      }
      {(!!edit || !!create) &&
        <div>
          <h2>{organization}/{repo}/{_path}/edit</h2>
          <Editor
            organization={organization}
            repo={repo}
            path={_path}
            create={create} />
        </div>
      }
    </App>
  )
})
