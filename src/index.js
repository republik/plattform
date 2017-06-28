import React from 'react';
import ReactDOM from 'react-dom';
import {Catalog} from 'catalog';
import {simulations} from 'glamor';
import theme from './catalogTheme';
import './catalogTheme.css';

import 'core-js/fn/array/from'
import 'core-js/fn/array/find'

simulations(true)

ReactDOM.render(
  <Catalog
    title='Styleguide'
    theme={theme}
    useBrowserHistory
    responsiveSizes={[
      {name: 'Klein', width: 320, height: 480},
      {name: 'Gross', width: 800, height: 480}
    ]}
    pages={[
      {
        path: '/',
        title: 'Übersicht',
        src: require('../README.md')
      },
      {
        title: 'Grundlagen',
        pages: [
          {
            path: '/logo',
            title: 'Logo',
            imports: {
              Logo: require('./components/Logo'),
              R: require('./components/Logo').R
            },
            src: require('./components/Logo/docs.md')
          },
          {
            path: '/typographie',
            title: 'Typographie',
            imports: {
              ...require('./components/Typography'),
              fontFamilies: require('./theme/fonts').fontFamilies
            },
            src: require('./components/Typography/docs.md')
          },
          {
            path: '/farben',
            title: 'Farben',
            component: require('./theme/colors.docs.js')
          },
          {
            path: '/grid',
            title: 'Grid',
            imports: require('./components/Grid'),
            src: require('./components/Grid/docs.md')
          }
        ]
      },
      {
        title: 'Komponenten',
        pages: [
          {
            path: '/components/button',
            title: 'Button',
            imports: {
              Button: require('./components/Button')
            },
            src: require('./components/Button/docs.md')
          },
          {
            path: '/formulare',
            title: 'Formulare',
            imports: {
              ...require('./components/Typography'),
              Button: require('./components/Button'),
              Checkbox: require('./components/Form/Checkbox.js'),
              Radio: require('./components/Form/Radio.js'),
              Field: require('./components/Form/Field.js'),
              AutosuggestField: require('./components/Form/AutosuggestField.js'),
              MaskedInput: require('react-maskedinput')
            },
            src: require('./components/Form/docs.md')
          }
        ]
      }
    ]}
  />,
  document.getElementById('root')
);
