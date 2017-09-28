'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListItem = undefined;
var _jsxFileName = '../publikator-frontend/components/Templates/NewsletterEmail/List.js';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ListItem = exports.ListItem = function ListItem(_ref) {
  var children = _ref.children;
  return _react2.default.createElement(
    'li',
    {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 4
      }
    },
    children
  );
};

exports.default = function (_ref2) {
  var children = _ref2.children,
      data = _ref2.data;
  return data.ordered ? _react2.default.createElement(
    'ol',
    { start: data.start, __source: {
        fileName: _jsxFileName,
        lineNumber: 8
      }
    },
    children
  ) : _react2.default.createElement(
    'ul',
    {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 9
      }
    },
    children
  );
};