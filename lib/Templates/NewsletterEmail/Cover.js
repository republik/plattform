'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Title = exports.Lead = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Lead = exports.Lead = () => null;

const Title = exports.Title = () => null;

exports.default = ({ data: { src, alt }, children }) => {
  return _react2.default.createElement(
    'tr',
    null,
    _react2.default.createElement(
      'td',
      { align: 'center', valign: 'top' },
      _react2.default.createElement('img', { src: (0, _utils.imageResizeUrl)(src, '1280x675'), alt: alt, border: '0', style: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: 'auto !important',
          maxWidth: '100% !important'
        } })
    )
  );
};