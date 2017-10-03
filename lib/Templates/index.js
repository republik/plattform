'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderMdast = undefined;
var _jsxFileName = '../publikator-frontend/components/Templates/index.js';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MissingMarkdownNodeType = function MissingMarkdownNodeType(_ref) {
  var node = _ref.node,
      children = _ref.children;
  return _react2.default.createElement(
    'span',
    { style: { background: '#FF5555', color: '#FFFFFF', display: 'inline-block', margin: 4 }, __source: {
        fileName: _jsxFileName,
        lineNumber: 4
      }
    },
    'Missing Markdown node type "',
    node.type,
    '"',
    node.identifier ? 'with identifier "' + node.identifier + '"' : '',
    ' ',
    children
  );
};

var renderMdast = exports.renderMdast = function renderMdast(mdast) {
  var schema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var rules = schema.rules;

  var visit = function visit(node, index, parent) {
    if (node.type === 'text') {
      return node.value;
    }

    var rule = rules.find(function (r) {
      return r.matchMdast(node);
    });
    if (!rule || !rule.component) {
      return _react2.default.createElement(
        MissingMarkdownNodeType,
        { key: index, node: node, __source: {
            fileName: _jsxFileName,
            lineNumber: 23
          }
        },
        visitChildren(node)
      );
    }

    var Component = rule.component;

    var data = rule.getData ? rule.getData(node, parent) : {};

    return _react2.default.createElement(
      Component,
      { key: index, data: data, __source: {
          fileName: _jsxFileName,
          lineNumber: 36
        }
      },
      rule.rules ? renderMdast(node.children, {
        rules: rule.rules
      }) : visitChildren(node)
    );
  };

  var visitArray = function visitArray(array, parent) {
    return array.map(function (item, index) {
      return visit(item, index, parent);
    });
  };

  var visitChildren = function visitChildren(node) {
    if (!node.children || node.children.length === 0) {
      return null;
    }
    return visitArray(node.children, node);
  };

  return Array.isArray(mdast) ? visitArray(mdast, null) : visit(mdast, 0, null);
};