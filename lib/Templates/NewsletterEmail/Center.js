'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '../publikator-frontend/components/Templates/NewsletterEmail/Center.js';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _email = require('../email');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var children = _ref.children;
  return _react2.default.createElement(
    'tr',
    {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 6
      }
    },
    _react2.default.createElement(
      'td',
      { align: 'center', valign: 'top', __source: {
          fileName: _jsxFileName,
          lineNumber: 7
        }
      },
      _react2.default.createElement(
        _email.Mso,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 8
          }
        },
        '\n      <table cellspacing="0" cellpadding="0" border="0" width="640">\n        <tr>\n          <td>\n        '
      ),
      _react2.default.createElement(
        'table',
        { align: 'center', border: '0', cellPadding: '0', cellSpacing: '0', width: '100%', style: {
            maxWidth: 640,
            color: '#444',
            fontSize: 18,
            fontFamily: 'Times, \'Times New Roman\', serif'
          }, __source: {
            fileName: _jsxFileName,
            lineNumber: 15
          }
        },
        _react2.default.createElement(
          'tbody',
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 21
            }
          },
          _react2.default.createElement(
            'tr',
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 22
              }
            },
            _react2.default.createElement(
              'td',
              { style: { padding: 20 }, className: 'body_content', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 23
                }
              },
              children
            )
          ),
          _react2.default.createElement(
            'tr',
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 27
              }
            },
            _react2.default.createElement(
              'td',
              { style: { padding: 20 }, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 28
                }
              },
              _react2.default.createElement(
                'p',
                {
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 29
                  }
                },
                _react2.default.createElement(
                  'a',
                  { href: 'https://www.republik.ch/', __source: {
                      fileName: _jsxFileName,
                      lineNumber: 30
                    }
                  },
                  _react2.default.createElement('img', { height: '79', src: 'https://gallery.mailchimp.com/650c1ec9003c7d8567eef4c5e/images/feb6bdde-83da-4211-bcf8-b09d3d3d012a.png', style: {
                      border: 0,
                      width: '180px !important',
                      height: '79px !important',
                      margin: 0,
                      maxWidth: '100% !important'
                    }, width: '180', alt: '', __source: {
                      fileName: _jsxFileName,
                      lineNumber: 31
                    }
                  })
                )
              ),
              _react2.default.createElement(
                'p',
                {
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 40
                  }
                },
                'Republik',
                _react2.default.createElement('br', {
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 41
                  }
                }),
                'c/o Hotel Rothaus',
                _react2.default.createElement('br', {
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 42
                  }
                }),
                'Sihlhallenstrasse 1',
                _react2.default.createElement('br', {
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 43
                  }
                }),
                '8004 Z\xFCrich',
                _react2.default.createElement('br', {
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 44
                  }
                }),
                'Schweiz'
              ),
              _react2.default.createElement('br', {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 46
                }
              }),
              _react2.default.createElement(
                'p',
                {
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 47
                  }
                },
                _react2.default.createElement(
                  'a',
                  { href: 'https://project-r.construction/', __source: {
                      fileName: _jsxFileName,
                      lineNumber: 48
                    }
                  },
                  _react2.default.createElement('img', { src: 'https://assets.project-r.construction/images/project_r_logo_newsletter.png', style: {
                      border: 0,
                      width: '50px !important',
                      height: '50px !important',
                      margin: 0,
                      maxWidth: '100% !important'
                    }, width: '50', height: '50', alt: '', __source: {
                      fileName: _jsxFileName,
                      lineNumber: 49
                    }
                  })
                )
              ),
              _react2.default.createElement('br', {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 58
                }
              }),
              'Project R Genossenschaft',
              _react2.default.createElement('br', {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 59
                }
              }),
              'Sihlhallenstrasse 1',
              _react2.default.createElement('br', {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 60
                }
              }),
              '8004 Z\xFCrich',
              _react2.default.createElement('br', {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 61
                }
              }),
              _react2.default.createElement('hr', {
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 62
                }
              }),
              _react2.default.createElement(
                'p',
                {
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 63
                  }
                },
                _react2.default.createElement(
                  'a',
                  { href: '*|UNSUB|*', __source: {
                      fileName: _jsxFileName,
                      lineNumber: 64
                    }
                  },
                  'Vom Newsletter abmelden'
                )
              )
            )
          )
        )
      ),
      _react2.default.createElement(
        _email.Mso,
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 70
          }
        },
        '\n      </td>\n    </tr>\n  </table>\n        '
      )
    )
  );
};