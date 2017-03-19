import React from 'react';
import ReactDOM from 'react-dom';
import {Catalog} from 'catalog';
import {simulations} from 'glamor';
import theme from './catalogTheme';
import './catalogTheme.css';

simulations(true)

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
        title: 'Grundlagen',
        pages: [
          {
            path: '/schriften',
            title: 'Schriften',
            src: require('../docs/fonts.md')
          },
          {
            path: '/farben',
            title: 'Farben',
            src: require('../docs/colors.md')
          },
          {
            path: '/grid',
            title: 'Grid',
            src: require('../docs/grid.md')
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
            src: require('./components/Button.docs.md')
          },
          {
            path: '/formulare',
            title: 'Formulare',
            src: require('./components/Form.docs.md')
          },
          {
            path: '/media',
            title: 'Bilder und Videos',
            src: require('./components/Media.docs.md')
          },
          {
            path: '/navigation',
            title: 'Navigation',
            src: require('./components/Navigation.docs.md')
          },
          {
            path: '/share',
            title: 'Share',
            src: require('./components/Share.docs.md')
          },
          {
            path: '/crowdfunding',
            title: 'Crowdfunding',
            src: require('./components/Crowdfunding.docs.md')
          },
          {
            path: '/community',
            title: 'Community',
            src: require('./components/Community.docs.md')
          },
          {
            path: '/kalender',
            title: 'Kalender',
            src: require('./components/Calendar.docs.md')
          },
          {
            path: '/manifest',
            title: 'Manifest',
            src: require('./components/Manifest.docs.md')
          }
        ]
      }
    ]}
  />,
  document.getElementById('root')
);
