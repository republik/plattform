'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Container = require('./Container');

var _Container2 = _interopRequireDefault(_Container);

var _Cover = require('./Cover');

var _Cover2 = _interopRequireDefault(_Cover);

var _Paragraph = require('./Paragraph');

var _Paragraph2 = _interopRequireDefault(_Paragraph);

var _Center = require('./Center');

var _Center2 = _interopRequireDefault(_Center);

var _Headlines = require('./Headlines');

var _Figure = require('./Figure');

var _Figure2 = _interopRequireDefault(_Figure);

var _Blockquote = require('./Blockquote');

var _Blockquote2 = _interopRequireDefault(_Blockquote);

var _List = require('./List');

var _List2 = _interopRequireDefault(_List);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const paragraph = {
  matchMdast: _utils.matchParagraph,
  component: _Paragraph2.default,
  rules: [{
    matchMdast: (0, _utils.matchType)('break'),
    component: _Paragraph.Br,
    isVoid: true
  }, {
    matchMdast: (0, _utils.matchType)('strong'),
    component: _Paragraph.Strong
  }, {
    matchMdast: (0, _utils.matchType)('emphasis'),
    component: _Paragraph.Em
  }, {
    matchMdast: (0, _utils.matchType)('link'),
    getData: node => ({
      title: node.title,
      href: node.url
    }),
    component: _Paragraph.Link
  }]
};

const schema = {
  rules: [{
    matchMdast: (0, _utils.matchType)('root'),
    component: _Container2.default
  }, {
    matchMdast: (0, _utils.matchZone)('COVER'),
    component: _Cover2.default,
    getData: node => {
      const img = node.children[0].children[0];
      return {
        alt: img.alt,
        src: img.url
      };
    },
    rules: [{
      matchMdast: _utils.matchImageParagraph,
      component: () => null,
      isVoid: true
    }, {
      matchMdast: (0, _utils.matchHeading)(1),
      component: _Cover.Title
    }, {
      matchMdast: (0, _utils.matchType)('blockquote'),
      component: _Cover.Lead,
      rules: [paragraph]
    }]
  }, {
    matchMdast: (0, _utils.matchZone)('CENTER'),
    component: _Center2.default,
    rules: [paragraph, {
      matchMdast: (0, _utils.matchHeading)(2),
      component: _Headlines.H2
    }, {
      matchMdast: (0, _utils.matchHeading)(3),
      component: _Headlines.H3
    }, {
      matchMdast: (0, _utils.matchZone)('FIGURE'),
      component: _Figure2.default,
      rules: [{
        matchMdast: _utils.matchImageParagraph,
        component: _Figure.Image,
        getData: node => ({
          src: node.children[0].url,
          alt: node.children[0].alt
        }),
        isVoid: true
      }, {
        matchMdast: _utils.matchParagraph,
        component: _Figure.Caption,
        getData: (node, parent) => parent && parent.data || {},
        rules: paragraph.rules
      }]
    }, {
      matchMdast: (0, _utils.matchType)('blockquote'),
      component: _Blockquote2.default,
      rules: [paragraph]
    }, {
      matchMdast: (0, _utils.matchType)('list'),
      component: _List2.default,
      getData: node => ({
        ordered: node.ordered,
        start: node.start
      }),
      rules: [{
        matchMdast: (0, _utils.matchType)('listItem'),
        component: _List.ListItem,
        rules: [paragraph]
      }]
    }]
  }]
};

exports.default = schema;