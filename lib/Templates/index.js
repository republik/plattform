'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderMdast = exports.MissingMarkdownNodeType = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MissingMarkdownNodeType = exports.MissingMarkdownNodeType = ({ node, children }) => _react2.default.createElement(
  'span',
  { style: { background: '#FF5555', color: '#FFFFFF', display: 'inline-block', margin: 4 } },
  'Missing Markdown node type "',
  node.type,
  '"',
  node.identifier ? `with identifier "${node.identifier}"` : '',
  ' ',
  children
);

const renderMdast = exports.renderMdast = (mdast, schema = {}) => {
  const rules = schema.rules;

  const visit = (node, index, parent) => {
    if (node.type === 'text') {
      return node.value;
    }

    const rule = rules.find(r => r.matchMdast(node));
    if (!rule || !rule.component) {
      return _react2.default.createElement(
        MissingMarkdownNodeType,
        { key: index, node: node },
        visitChildren(node)
      );
    }

    const Component = rule.component;

    const data = rule.getData ? rule.getData(node, parent) : {};

    let children = null;
    if (rule.rules) {
      children = renderMdast(node.children, {
        rules: rule.rules
      });
    } else if (!rule.isVoid) {
      children = visitChildren(node);
    }

    return _react2.default.createElement(
      Component,
      { key: index, data: data },
      children
    );
  };

  const visitArray = (array, parent) => {
    return array.map((item, index) => visit(item, index, parent));
  };

  const visitChildren = node => {
    if (!node.children || node.children.length === 0) {
      return null;
    }
    return visitArray(node.children, node);
  };

  return Array.isArray(mdast) ? visitArray(mdast, null) : visit(mdast, 0, null);
};