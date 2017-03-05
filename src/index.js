import React from 'react';
import ReactDOM from 'react-dom';
import {Catalog} from 'catalog';
import theme from './theme';
import './theme.css';

ReactDOM.render(
  <Catalog
    title='Styleguide'
    theme={theme}
    useBrowserHistory={false}
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
