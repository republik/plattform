import React from 'react';
import ReactDOM from 'react-dom';
import {Catalog} from 'catalog';

ReactDOM.render(
  <Catalog
    title='R Styleguide'
    useBrowserHistory={true}
    pages={[
      {
        path: '/',
        title: 'Foo',
        imports: {Foo: require('./components/Foo/Foo')},
        src: require('./components/Foo/Foo.docs.md')
      },
      {
        path: '/logo',
        title: 'Logo',
        src: require('../docs/logo.md')
      }
    ]}
  />,
  document.getElementById('root')
);
