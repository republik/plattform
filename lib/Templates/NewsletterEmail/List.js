'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListItem = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ListItem = exports.ListItem = ({ children }) => _react2.default.createElement(
  'li',
  null,
  children
);

exports.default = ({ children, data }) => data.ordered ? _react2.default.createElement(
  'ol',
  { start: data.start },
  children
) : _react2.default.createElement(
  'ul',
  null,
  children
);