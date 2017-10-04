'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Caption = exports.Image = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Image = exports.Image = ({ data }) => _react2.default.createElement('img', { key: 'image',
  style: {
    border: '0px',
    width: '640px',
    height: 'auto',
    margin: '0px',
    maxWidth: '100% !important'
  },
  width: '640',
  src: (0, _utils.imageResizeUrl)(data.src, '600x'),
  alt: data.alt
});

const Caption = exports.Caption = ({ children, data }) => _react2.default.createElement(
  'p',
  { key: 'caption', style: {
      fontSize: '14px',
      fontFamily: 'arial,helvetica neue,helvetica,sans-serif',
      marginTop: '5px'
      // obey data.captionRight?
    } },
  children
);

exports.default = ({ children }) => _react2.default.createElement(
  'span',
  null,
  children
);