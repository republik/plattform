'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Caption = exports.Image = undefined;
var _jsxFileName = '../publikator-frontend/components/Templates/NewsletterEmail/Figure.js';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Image = exports.Image = function Image(_ref) {
  var data = _ref.data;
  return _react2.default.createElement('img', { key: 'image',
    style: {
      border: '0px',
      width: '640px',
      height: 'auto',
      margin: '0px',
      maxWidth: '100% !important'
    },
    width: '640',
    src: (0, _utils.imageResizeUrl)(data.src, '600x'),
    alt: data.alt,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 6
    }
  });
};

var Caption = exports.Caption = function Caption(_ref2) {
  var children = _ref2.children,
      data = _ref2.data;
  return _react2.default.createElement(
    'p',
    { key: 'caption', style: {
        fontSize: '14px',
        fontFamily: 'arial,helvetica neue,helvetica,sans-serif',
        marginTop: '5px'
        // obey data.captionRight?
      }, __source: {
        fileName: _jsxFileName,
        lineNumber: 20
      }
    },
    children
  );
};

exports.default = function (_ref3) {
  var children = _ref3.children;
  return _react2.default.createElement(
    'span',
    {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 31
      }
    },
    children
  );
};