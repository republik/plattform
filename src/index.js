import React from 'react'
import ReactDOM from 'react-dom'
import {Catalog} from 'catalog'
import {simulations, css} from 'glamor'
import theme from './catalogTheme'
import './catalogTheme.css'
import {fontStyles} from './components/Typography'

import 'core-js/fn/array/from'
import 'core-js/fn/array/find'

import {fontFaces} from './theme/fonts';
import {createFormatter} from './lib/translate'

simulations(true)

const styleTag = document.createElement('style')
styleTag.innerHTML = fontFaces()
document.body.appendChild(styleTag)

const t = createFormatter(
  require('./lib/translations.json').data
)

ReactDOM.render(
  <Catalog
    title='Style Guide'
    theme={theme}
    useBrowserHistory
    responsiveSizes={[
      {name: 'Klein', width: 320, height: 480},
      {name: 'Gross', width: 800, height: 480}
    ]}
    pages={[
      {
        path: '/',
        title: 'Overview',
        src: require('./README.md')
      },
      {
        title: 'Base',
        pages: [
          {
            path: '/logo',
            title: 'Logo',
            imports: {
              Logo: require('./components/Logo'),
              BrandMark: require('./components/Logo/BrandMark')
            },
            src: require('./components/Logo/docs.md')
          },
          {
            path: '/typography',
            title: 'Typography',
            imports: {
              ...require('./components/Typography'),
              css,
              styles: JSON.parse(JSON.stringify(fontStyles)),
              fontFamilies: require('./theme/fonts').fontFamilies
            },
            src: require('./components/Typography/docs.md')
          },
          {
            path: '/colors',
            title: 'Colors',
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
        title: 'Components',
        pages: [
          {
            path: '/components/spinner',
            title: 'Spinner',
            imports: {
              Spinner: require('./components/Spinner'),
              InlineSpinner: require('./components/Spinner').InlineSpinner
            },
            src: require('./components/Spinner/docs.md')
          },
          {
            path: '/components/loader',
            title: 'Loader',
            imports: {
              ...require('./components/Typography'),
              Loader: require('./components/Loader'),
              Spinner: require('./components/Spinner'),
              NarrowContainer: require('./components/Grid').NarrowContainer
            },
            src: require('./components/Loader/docs.md')
          },
          {
            path: '/components/button',
            title: 'Button',
            imports: {
              Button: require('./components/Button')
            },
            src: require('./components/Button/docs.md')
          },
          {
            path: '/forms',
            title: 'Forms',
            imports: {
              css,
              ...require('./components/Typography'),
              Button: require('./components/Button'),
              Checkbox: require('./components/Form/Checkbox.js'),
              Radio: require('./components/Form/Radio.js'),
              Field: require('./components/Form/Field.js'),
              FieldSet: require('./components/Form/FieldSet.js'),
              AutosuggestField: require('./components/Form/AutosuggestField.js'),
              MaskedInput: require('react-maskedinput'),
              AutosizeInput: require('react-textarea-autosize')
            },
            src: require('./components/Form/docs.md')
          },
          {
            path: '/components/comment',
            title: 'Comment',
            imports: {
              Comment: require('./components/Comment/Comment'),
              CommentHeader: require('./components/Comment/CommentHeader'),
              CommentActions: require('./components/Comment/CommentActions')
            },
            src: require('./components/Comment/docs.md')
          },
          {
            path: '/components/comment-composer',
            title: 'CommentComposer',
            imports: {
              t,
              CommentComposer: require('./components/CommentComposer/CommentComposer'),
              CommentComposerHeader: require('./components/CommentComposer/CommentComposerHeader'),
            },
            src: require('./components/CommentComposer/docs.md')
          },
        ]
      },
      {
        title: 'Development',
        pages: [
          {
            path: '/dev/process',
            title: 'Process',
            src: require('./development/process.docs.md')
          },
          {
            path: '/dev/translate',
            title: 'Translate',
            src: require('./lib/translate.docs.md'),
            imports: {
              Field: require('./components/Form/Field.js'),
              ...require('./components/Typography'),
              t: createFormatter([
                {key: 'styleguide/Hello/generic', value: 'Hallo!'},
                {key: 'styleguide/Hello/greetings', value: 'Hallo {name}'},
                {key: 'styleguide/Hello/greetings/Thomas', value: 'Hoi Thomas'},
                {key: 'styleguide/Hello/message/0', value: 'Sie waren noch nie hier'},
                {key: 'styleguide/Hello/message/1', value: 'Willkommen an Bord {name}!'},
                {key: 'styleguide/Hello/message/2', value: 'Schön Sie wieder zu sehen!'},
                {key: 'styleguide/Hello/message/other', value: 'Willkommen zum {count}. Mal {name}!'},
                {key: 'styleguide/Hello/label/visits', value: 'Anzahl Besuche'},
                {key: 'styleguide/Hello/label/name', value: 'Name'},
              ])
            }
          }
        ]
      },
    ]}
  />,
  document.getElementById('root')
);
