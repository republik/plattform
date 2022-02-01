import { Tokenizr } from 'ts-tokenizr'

export enum TokenType {
  DATE = 'DATE',
  TIME = 'TIME',
  WHITESPACE = 'WHITESPACE',
  KIND = 'KIND',
  PUNCTUATION = 'PUNCTUATION',
  SPECIAL = 'SPECIAL',
  NUMBER = 'NUMBER',
  WORD = 'WORD',
  EOF = 'EOF',
}

export class Lexer {
  getLexerInstance(): Tokenizr {
    return (
      new Tokenizr()
        .rule(/\d{1,2}\.\d{1,2}\.\d{2,4}/, (ctx) => {
          ctx.accept(TokenType.DATE)
        })
        .rule(/\d{1,2}[.:]\d{1,2}/, (ctx) => {
          ctx.accept(TokenType.TIME)
        })
        .rule(/\s/, (ctx) => {
          ctx.accept(TokenType.WHITESPACE)
        })
        .rule(/\((.+?)\)/, (ctx, match) => {
          ctx.accept(TokenType.KIND, match[1])
        })
        .rule(/[,:]/, (ctx) => {
          ctx.accept(TokenType.PUNCTUATION)
        })
        .rule(/[&]/, (ctx) => {
          ctx.accept(TokenType.SPECIAL)
        })
        .rule(/\d+/, (ctx) => {
          ctx.accept(TokenType.NUMBER)
        })
        // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Unicode_Property_Escapes#general_categories
        // const word = s.scan(/«?([\p{L}\p{P}\p{M}-]+)»?/u)
        // const word = s.scan(/\p{P}?([\p{L}\p{M}-]+)\p{P}?/u)
        // \u00AB — « (LEFT-POINTING DOUBLE ANGLE QUOTATION MARK)
        // \u00AB — » (RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK)
        // \u2019 — ’ (RIGHT SINGLE QUOTATION MARK)
        .rule(/\u00AB?([\p{L}\p{M}/.\u2019-]+)\u00BB?/u, (ctx, match) => {
          ctx.accept(TokenType.WORD, match[1])
        })
    )
  }
}
