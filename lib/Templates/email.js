'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderEmail = exports.Mso = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _ = require('./');

require('react-dom');

var _DOMProperty = require('react-dom/lib/DOMProperty');

var _DOMProperty2 = _interopRequireDefault(_DOMProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// monkey patch react 15
// can be removed with react 16
const emailAttributes = {
  Properties: {
    align: 0,
    valign: 0,
    bgcolor: 0,
    border: 0
  }
};

_DOMProperty2.default.injection.injectDOMPropertyConfig(emailAttributes);

const Mso = exports.Mso = ({ children, gte }) => _react2.default.createElement('mso', { 'data-gte': gte, dangerouslySetInnerHTML: {
    __html: children
  } });

const DOCTYPE = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

const renderEmail = exports.renderEmail = (mdast, schema = {}) => DOCTYPE + _server2.default.renderToStaticMarkup((0, _.renderMdast)(mdast, schema)).split('<mso>').join('<!--[if mso]>').split('<mso data-gte="15">').join('<!--[if gte mso 15]>').split('</mso>').join('<![endif]-->');