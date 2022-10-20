import { Lexer, TokenType } from './lexer'

interface Contributor {
  name: string
  kind?: string
}

interface Flags {
  afterBy: boolean
}

export class Analyzer {
  private contributors: Contributor[]
  private flags: Flags
  private lexer: Lexer

  constructor() {
    this.contributors = []
    this.flags = { afterBy: false }
    this.lexer = new Lexer()
  }

  private isByIndicator(string: string) {
    return !!string.match(/^(von|mit|by|de|par)$/i)
  }

  private isGlueIndicator(string: string) {
    return !!string.match(/^(und|mit|and|with|et|sowie)$/i)
  }

  public getAnalysis(string: string) {
    const tokens = this.lexer.getLexerInstance().input(string).tokens()

    let contributor = ''

    tokens.forEach((token) => {
      const { value, type } = token

      if (typeof value !== 'string') {
        return
      }

      if (
        !this.flags.afterBy &&
        type === TokenType.WORD &&
        this.isByIndicator(value)
      ) {
        this.flags.afterBy = true
        contributor = ''
        return
      }

      if (this.flags.afterBy) {
        if (type === TokenType.WORD && this.isGlueIndicator(value)) {
          contributor.trim() &&
            this.contributors.push({ name: contributor.trim() })
          contributor = ''
          return
        }

        if (type === TokenType.WORD) {
          contributor += value
          return
        }

        if (type === TokenType.WHITESPACE) {
          if (!contributor.endsWith(' ')) {
            contributor += value
          }
          return
        }

        if (type === TokenType.SPECIAL) {
          contributor += value
          return
        }

        if (type === TokenType.PUNCTUATION) {
          contributor.trim() &&
            this.contributors.push({ name: contributor.trim() })
          contributor = ''
          return
        }

        if (type === TokenType.KIND) {
          contributor.trim() &&
            this.contributors.push({ name: contributor.trim() })
          contributor = ''

          this.contributors.forEach((c, index, contributors) => {
            if (!c.kind) {
              contributors[index] = { ...c, kind: value }
            }
          })

          return
        }

        if (type === TokenType.EOF) {
          contributor.trim() &&
            this.contributors.push({ name: contributor.trim() })
          contributor = ''
          return
        }
      }
    })

    const contributors = this.contributors.filter(
      ({ name }) =>
        name !== 'Update' &&
        !name.includes('letztes Update') &&
        !name.includes('Update um') &&
        !name.includes('Update Uhr'),
    )
    contributors.forEach((c, index, all) => {
      if (!c.kind) {
        all[index] = { ...c, kind: 'Text' }
      }
    })

    return {
      string,
      contributors,
    }
  }
}
