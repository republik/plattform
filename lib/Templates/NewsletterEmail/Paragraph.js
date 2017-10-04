'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Link = exports.Em = exports.Strong = exports.Br = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Br = exports.Br = () => _react2.default.createElement('br', null);
const Strong = exports.Strong = ({ children }) => _react2.default.createElement(
  'strong',
  null,
  children
);
const Em = exports.Em = ({ children }) => _react2.default.createElement(
  'em',
  null,
  children
);
const Link = exports.Link = ({ children, data }) => _react2.default.createElement(
  'a',
  {
    href: data.href,
    title: data.title },
  children
);

exports.default = ({ children }) => _react2.default.createElement(
  'p',
  null,
  children
);