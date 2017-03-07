import React from 'react';
import ReactDOM from 'react-dom';
import {Catalog} from 'catalog';
import theme from './theme';
import './theme.css';

ReactDOM.render(
  <Catalog
    title='Styleguide'
    theme={theme}
    useBrowserHistory
    pages={[
      {
        path: '/logo',
        title: 'Logo',
        src: require('../docs/logo.md')
      },
      {
        title: 'Components',
        pages: [
          {
            path: '/components/button',
            title: 'Button',
            imports: {
              Button: require('./components/Button')
            },
            src: require('./components/Button.docs.md')
          }
        ]
      }
    ]}
  />,
  document.getElementById('root')
);
