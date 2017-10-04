'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _email = require('../email');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = ({ children }) => _react2.default.createElement(
  'html',
  null,
  _react2.default.createElement(
    'head',
    null,
    _react2.default.createElement('meta', { charSet: 'UTF-8' }),
    _react2.default.createElement('meta', { httpEquiv: 'x-ua-compatible', content: 'IE=edge' }),
    _react2.default.createElement('meta', { name: 'viewport', content: 'width=device-width,initial-scale=1' }),
    _react2.default.createElement(
      _email.Mso,
      { gte: '15' },
      `
        <xml>
          <o:officedocumentsettings>
            <o:allowpng />
            <o:pixelsperinch>96</o:pixelsperinch>
          </o:officedocumentsettings>
        </xml>
        `
    ),
    _react2.default.createElement(
      'title',
      null,
      '*|MC:SUBJECT|*'
    ),
    _react2.default.createElement(
      _email.Mso,
      null,
      `
        <style>
          table img {
          width:800px !important;
          max-width:800px !important;
          height:auto !important;
          }
          table .body_content img {
          width:640px !important;
          max-width:640px !important;
          height:auto !important;
          }
        </style>
        `
    ),
    _react2.default.createElement('style', { type: 'text/css', dangerouslySetInnerHTML: { __html: `
        img{
          height:auto !important;
          max-width:100% !important;
          width:100% !important;
        }
      ` } })
  ),
  _react2.default.createElement(
    'body',
    { style: { margin: 0, padding: 0, backgroundColor: '#fff' } },
    _react2.default.createElement(
      _email.Mso,
      null,
      `
        <div>
          <table cellspacing="0" cellpadding="0" border="0" width="800">
            <tr>
              <td>
        `
    ),
    _react2.default.createElement(
      'table',
      { border: '0', cellPadding: '0', cellSpacing: '0', width: '100%' },
      _react2.default.createElement(
        'tbody',
        null,
        children
      )
    ),
    _react2.default.createElement(
      _email.Mso,
      null,
      `
              </td>
            </tr>
          </table>
        </div>
        `
    )
  )
);