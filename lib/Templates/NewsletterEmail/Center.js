'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _email = require('../email');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = ({ children }) => _react2.default.createElement(
  'tr',
  null,
  _react2.default.createElement(
    'td',
    { align: 'center', valign: 'top' },
    _react2.default.createElement(
      _email.Mso,
      null,
      `
      <table cellspacing="0" cellpadding="0" border="0" width="640">
        <tr>
          <td>
        `
    ),
    _react2.default.createElement(
      'table',
      { align: 'center', border: '0', cellPadding: '0', cellSpacing: '0', width: '100%', style: {
          maxWidth: 640,
          color: '#444',
          fontSize: 18,
          fontFamily: 'Times, \'Times New Roman\', serif'
        } },
      _react2.default.createElement(
        'tbody',
        null,
        _react2.default.createElement(
          'tr',
          null,
          _react2.default.createElement(
            'td',
            { style: { padding: 20 }, className: 'body_content' },
            children
          )
        ),
        _react2.default.createElement(
          'tr',
          null,
          _react2.default.createElement(
            'td',
            { style: { padding: 20 } },
            _react2.default.createElement(
              'p',
              null,
              _react2.default.createElement(
                'a',
                { href: 'https://www.republik.ch/' },
                _react2.default.createElement('img', { height: '79', src: 'https://gallery.mailchimp.com/650c1ec9003c7d8567eef4c5e/images/feb6bdde-83da-4211-bcf8-b09d3d3d012a.png', style: {
                    border: 0,
                    width: '180px !important',
                    height: '79px !important',
                    margin: 0,
                    maxWidth: '100% !important'
                  }, width: '180', alt: '' })
              )
            ),
            _react2.default.createElement(
              'p',
              null,
              'Republik',
              _react2.default.createElement('br', null),
              'c/o Hotel Rothaus',
              _react2.default.createElement('br', null),
              'Sihlhallenstrasse 1',
              _react2.default.createElement('br', null),
              '8004 Z\xFCrich',
              _react2.default.createElement('br', null),
              'Schweiz'
            ),
            _react2.default.createElement('br', null),
            _react2.default.createElement(
              'p',
              null,
              _react2.default.createElement(
                'a',
                { href: 'https://project-r.construction/' },
                _react2.default.createElement('img', { src: 'https://assets.project-r.construction/images/project_r_logo_newsletter.png', style: {
                    border: 0,
                    width: '50px !important',
                    height: '50px !important',
                    margin: 0,
                    maxWidth: '100% !important'
                  }, width: '50', height: '50', alt: '' })
              )
            ),
            _react2.default.createElement('br', null),
            'Project R Genossenschaft',
            _react2.default.createElement('br', null),
            'Sihlhallenstrasse 1',
            _react2.default.createElement('br', null),
            '8004 Z\xFCrich',
            _react2.default.createElement('br', null),
            _react2.default.createElement('hr', null),
            _react2.default.createElement(
              'p',
              null,
              _react2.default.createElement(
                'a',
                { href: '*|UNSUB|*' },
                'Vom Newsletter abmelden'
              )
            )
          )
        )
      )
    ),
    _react2.default.createElement(
      _email.Mso,
      null,
      `
      </td>
    </tr>
  </table>
        `
    )
  )
);