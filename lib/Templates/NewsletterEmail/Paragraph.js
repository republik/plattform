'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Link = exports.Em = exports.Strong = exports.Br = undefined;
var _jsxFileName = '../publikator-frontend/components/Templates/NewsletterEmail/Paragraph.js';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Br = exports.Br = function Br() {
  return _react2.default.createElement('br', {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 3
    }
  });
};
var Strong = exports.Strong = function Strong(_ref) {
  var children = _ref.children;
  return _react2.default.createElement(
    'strong',
    {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 4
      }
    },
    children
  );
};
var Em = exports.Em = function Em(_ref2) {
  var children = _ref2.children;
  return _react2.default.createElement(
    'em',
    {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 5
      }
    },
    children
  );
};
var Link = exports.Link = function Link(_ref3) {
  var children = _ref3.children,
      data = _ref3.data;
  return _react2.default.createElement(
    'a',
    {
      href: data.href,
      title: data.title, __source: {
        fileName: _jsxFileName,
        lineNumber: 7
      }
    },
    children
  );
};

exports.default = function (_ref4) {
  var children = _ref4.children;
  return _react2.default.createElement(
    'p',
    {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 15
      }
    },
    children
  );
};