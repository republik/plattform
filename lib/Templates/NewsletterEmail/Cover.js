'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Title = exports.Lead = undefined;
var _jsxFileName = '../publikator-frontend/components/Templates/NewsletterEmail/Cover.js';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Lead = exports.Lead = function Lead() {
  return null;
};

var Title = exports.Title = function Title() {
  return null;
};

exports.default = function (_ref) {
  var _ref$data = _ref.data,
      src = _ref$data.src,
      alt = _ref$data.alt,
      children = _ref.children;

  return _react2.default.createElement(
    'tr',
    {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 11
      }
    },
    _react2.default.createElement(
      'td',
      { align: 'center', valign: 'top', __source: {
          fileName: _jsxFileName,
          lineNumber: 12
        }
      },
      _react2.default.createElement('img', { src: (0, _utils.imageResizeUrl)(src, '1280x675'), alt: alt, border: '0', style: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: 'auto !important',
          maxWidth: '100% !important'
        }, __source: {
          fileName: _jsxFileName,
          lineNumber: 13
        }
      })
    )
  );
};