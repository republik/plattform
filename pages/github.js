import React, { Component } from 'react'
import withData from '../lib/apollo/withData'

import App from '../lib/App'
import Repositories from '../lib/github/components/Repository/List'
import Branches from '../lib/github/components/Branch/List'
import Tree from '../lib/github/components/Tree/List'
import Editor from '../lib/github/components/Editor'

export default withData(({ url: { query: { organization, repo, branch, oid, filename } } }) =>
  <App>
    {!repo && !branch &&
      <div>
        <h2>{organization}/</h2>
        <Repositories organization={organization} />
      </div>
    }
    {repo && !branch &&
      <div>
        <h2>{organization}/{repo}</h2>
        <Branches organization={organization} repo={repo} />
      </div>
    }
    {branch && !oid &&
      <div>
        <h2>{organization}/{repo}/{branch}</h2>
        <Tree organization={organization} repo={repo} branch={branch} />
      </div>
    }
    {oid &&
      <div>
        <h2>{organization}/{repo}/{branch}/{filename}</h2>
        <Editor organization={organization} repo={repo} branch={branch} oid={oid} filename={filename} />
      </div>
    }
  </App>
)
