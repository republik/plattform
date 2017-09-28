'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '../publikator-frontend/components/Templates/NewsletterEmail/Container.js';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _email = require('../email');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var children = _ref.children;
  return _react2.default.createElement(
    'html',
    {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 6
      }
    },
    _react2.default.createElement(
      'head',
      {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 7
        }
      },
      _react2.default.createElement('meta', { charSet: 'UTF-8', __source: {
          fileName: _jsxFileName,
          lineNumber: 8
        }
      }),
      _react2.default.createElement('meta', { httpEquiv: 'x-ua-compatible', content: 'IE=edge', __source: {
          fileName: _jsxFileName,
          lineNumber: 9
        }
      }),
      _react2.default.createElement('meta', { name: 'viewport', content: 'width=device-width,initial-scale=1', __source: {
          fileName: _jsxFileName,
          lineNumber: 10
        }
      }),
      _react2.default.createElement(
        _email.Mso,
        { gte: '15', __source: {
            fileName: _jsxFileName,
            lineNumber: 11
          }
        },
        '\n        <xml>\n          <o:officedocumentsettings>\n            <o:allowpng />\n            <o:pixelsperinch>96</o:pixelsperinch>\n          </o:officedocumentsettings>\n        </xml>\n        '
      ),
      _react2.default.createElement(
        'title',
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 21
          }
        },
        '*|MC:SUBJECT|*'
      ),
      _react2.default.createElement(
        _email.Mso,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 22
          }
        },
        '\n        <style>\n          table img {\n          width:800px !important;\n          max-width:800px !important;\n          height:auto !important;\n          }\n          table .body_content img {\n          width:640px !important;\n          max-width:640px !important;\n          height:auto !important;\n          }\n        </style>\n        '
      ),
      _react2.default.createElement('style', { type: 'text/css', dangerouslySetInnerHTML: { __html: '\n        img{\n          height:auto !important;\n          max-width:100% !important;\n          width:100% !important;\n        }\n      ' }, __source: {
          fileName: _jsxFileName,
          lineNumber: 38
        }
      })
    ),
    _react2.default.createElement(
      'body',
      { style: { margin: 0, padding: 0, backgroundColor: '#fff' }, __source: {
          fileName: _jsxFileName,
          lineNumber: 46
        }
      },
      _react2.default.createElement(
        _email.Mso,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 47
          }
        },
        '\n        <div>\n          <table cellspacing="0" cellpadding="0" border="0" width="800">\n            <tr>\n              <td>\n        '
      ),
      _react2.default.createElement(
        'table',
        { border: '0', cellPadding: '0', cellSpacing: '0', width: '100%', __source: {
            fileName: _jsxFileName,
            lineNumber: 55
          }
        },
        _react2.default.createElement(
          'tbody',
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 56
            }
          },
          children
        )
      ),
      _react2.default.createElement(
        _email.Mso,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 60
          }
        },
        '\n              </td>\n            </tr>\n          </table>\n        </div>\n        '
      )
    )
  );
};