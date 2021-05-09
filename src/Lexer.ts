import { SyntaxError } from "./BaseError";
import { Position } from "./Position";
import { KEYWORD, Token, TT } from "./Token";

const DEC_EXP = /[\d\.]/;
const NUMBER_EXP = /[a-f\d\._]/i;
const IDENT_EXP = /\w/; // [A-Za-z0-9_]

/**
 * 将源码字符串解析为Token表
 */
export class Lexer {
  pos: Position = new Position(0, 0, 0, this.text);
  constructor(private text: string) {}

  get c(): string {
    if (this.pos.index >= this.text.length) return "\0";
    else return this.text[this.pos.index];
  }

  private next() {
    this.pos.next(this.c);
  }

  makeTokens(): Token[] {
    const tokens: Token[] = [];
    while (this.c !== "\0") {
      tokens.push(this.nextToken());
    }
    tokens.push(new Token(TT.EOF, "EOF", this.pos));
    return tokens;
  }

  nextToken(): Token {
    const posStart: Position = this.pos.copy();
    if (DEC_EXP.test(this.c)) {
      return this.makeNumber();
    }

    if (IDENT_EXP.test(this.c)) {
      let type = TT.IDENTIFIER;
      let val: string = "";
      while (IDENT_EXP.test(this.c)) {
        val += this.c;
        this.next();
      }

      if (KEYWORD.includes(val)) type = TT.KEYWORD;
      return new Token(type, val, posStart, this.pos);
    }

    switch (this.c) {
      case " ":
      case "\t":
      case "\r":
      case "\n":
        return this.makeSpace();
      case '"': {
        return this.makeString('"');
      }
      case "'": {
        return this.makeString("'");
      }
      case ";": {
        this.next();
        return new Token(TT.SEMICOLON, ";", posStart);
      }
      case ",": {
        this.next();
        return new Token(TT.COMMA, ",", posStart);
      }
      case ":": {
        this.next();
        return new Token(TT.COLON, ":", posStart);
      }
      case "?": {
        this.next();
        if ((this.c as string) === "?") {
          this.next();
          if ((this.c as string) === "=") {
            return new Token(TT.NULLISH_EQ, "??=", posStart, this.pos);
          }
          return new Token(TT.NULLISH, "??", posStart, this.pos);
        } else {
          return new Token(TT.QMAKE, "?", posStart);
        }
      }
      case "%": {
        this.next();
        if ((this.c as string) === "=") {
          this.next();
          return new Token(TT.REMAINDER_EQ, "%=", posStart, this.pos);
        } else {
          return new Token(TT.REMAINDER, "%", posStart);
        }
      }
      case "~": {
        this.next();
        return new Token(TT.BNOT, "~", posStart);
      }
      case "+": {
        this.next();
        if ((this.c as string) === "=") {
          this.next();
          return new Token(TT.PLUS_EQ, "+=", posStart, this.pos);
        } else {
          return new Token(TT.PLUS, "+", posStart);
        }
      }
      case "-": {
        this.next();
        if ((this.c as string) === "=") {
          this.next();
          return new Token(TT.MINUS_EQ, "-=", posStart, this.pos);
        } else {
          return new Token(TT.MINUS, "-", posStart);
        }
      }
      case "*": {
        this.next();
        if ((this.c as string) === "*") {
          this.next();

          if ((this.c as string) === "=") {
            this.next();
            return new Token(TT.POW_EQ, "**=", posStart, this.pos);
          }

          return new Token(TT.POW, "**", posStart, this.pos);
        }

        if ((this.c as string) === "=") {
          this.next();
          return new Token(TT.MUL_EQ, "*=", posStart, this.pos);
        }

        return new Token(TT.MUL, "*", posStart);
      }
      case "/": {
        this.next();
        if ((this.c as string) === "=") {
          this.next();
          return new Token(TT.DIV_EQ, "/=", posStart, this.pos);
        } else if ((this.c as string) === "/") {
          this.next();
          let val = "";
          while ((this.c as string) !== "\n" && (this.c as string) !== "\r") {
            val += this.c;
            this.next();
          }
          return new Token(TT.COMMENT, val, posStart, this.pos);
        } else if ((this.c as string) === "*") {
          this.next();
          let val = "";
          while (true) {
            if ((this.c as string) === "*") {
              this.next();
              if ((this.c as string) === "/") {
                this.next();
                break;
              }
            }
            val += this.c;
            this.next();
          }
          return new Token(TT.COMMENT, val, posStart, this.pos);
        } else {
          return new Token(TT.DIV, "/", posStart);
        }
      }
      case "(": {
        this.next();
        return new Token(TT.LPAREN, "(", posStart);
      }
      case ")":
        this.next();
        return new Token(TT.RPAREN, ")", posStart);
      case "{": {
        this.next();
        return new Token(TT.LBLOCK, "{", posStart);
      }
      case "}":
        this.next();
        return new Token(TT.RBLOCK, "}", posStart);
      case "[":
        this.next();
        return new Token(TT.LSQUARE, "[", posStart);
      case "]":
        this.next();
        return new Token(TT.RSQUARE, "]", posStart);
      case "!": {
        this.next();
        if ((this.c as string) === "=") {
          this.next();
          return new Token(TT.NE, "!=", posStart, this.pos);
        } else {
          return new Token(TT.NOT, "!", posStart);
        }
      }
      case "^":
        this.next();
        if ((this.c as string) === "=") {
          this.next();
          return new Token(TT.XOR_EQ, "^=", posStart);
        }
        return new Token(TT.XOR, "^", posStart);
      case "<": {
        this.next();
        if ((this.c as string) === "=") {
          this.next();
          return new Token(TT.LTE, "<=", posStart, this.pos);
        }

        if ((this.c as string) === "<") {
          this.next();
          if ((this.c as string) === "=") {
            this.next();
            return new Token(TT.SHL_EQ, "<<=", posStart, this.pos);
          }
          return new Token(TT.SHL, "<<", posStart, this.pos);
        }
        return new Token(TT.LT, "<", posStart);
      }
      case ">": {
        this.next();
        if ((this.c as string) === "=") {
          this.next();
          return new Token(TT.GTE, ">=", posStart, this.pos);
        }

        if ((this.c as string) === ">") {
          this.next();
          if ((this.c as string) === "=") {
            this.next();
            return new Token(TT.SHR_EQ, ">>=", posStart, this.pos);
          }
          return new Token(TT.SHR, ">>", posStart, this.pos);
        }

        return new Token(TT.GT, ">", posStart);
      }
      case "=": {
        this.next();
        if ((this.c as string) === "=") {
          this.next();
          return new Token(TT.EE, "==", posStart, this.pos);
        } else if ((this.c as string) === ">") {
          this.next();
          return new Token(TT.ARROW, "=>", posStart, this.pos);
        } else {
          return new Token(TT.EQ, "=", posStart);
        }
      }
      case "&": {
        this.next();
        if (this.c === "&") {
          this.next();

          if ((this.c as string) === "=") {
            this.next();
            return new Token(TT.AND_EQ, "&&=", posStart, this.pos);
          }

          return new Token(TT.AND, "&&", posStart, this.pos);
        }

        if (this.c === "=") {
          this.next();
          return new Token(TT.BAND_EQ, "&=", posStart, this.pos);
        }

        return new Token(TT.BAND, "&", posStart);
      }
      case "|": {
        this.next();
        if (this.c === "|") {
          this.next();

          if ((this.c as string) === "=") {
            this.next();
            return new Token(TT.OR_EQ, "||=", posStart, this.pos);
          }

          return new Token(TT.OR, "||", posStart, this.pos);
        }

        if (this.c === "=") {
          this.next();
          return new Token(TT.BOR_EQ, "|=", posStart, this.pos);
        }

        return new Token(TT.BOR, "|", posStart);
      }
      default:
        this.next();
        throw new SyntaxError(
          "Invalid or unexpected token",
          posStart,
          this.pos
        ).toString();
    }
  }

  makeString(c: string): Token {
    const posStart = this.pos.copy();
    let val = "";
    let escapeCharacter = false;
    const escapeCaracters = {
      n: "\n",
      r: "\r",
      t: "\t",
    };
    this.next();
    while (this.c !== c || escapeCharacter) {
      if (escapeCharacter) {
        val += escapeCaracters[this.c] || this.c;
        escapeCharacter = false;
      } else {
        if (this.c === "\\") {
          escapeCharacter = true;
        } else {
          val += this.c;
          escapeCharacter = false;
        }
      }
      this.next();
    }
    this.next();
    return new Token(TT.STRING, val, posStart, this.pos);
  }

  /**
   * number 语法
   * https://www.nasm.us/xdoc/2.15.05/html/nasmdoc3.html#section-3.2#section-3.4.1
   */
  private makeNumber(): Token {
    const posStart = this.pos.copy();
    let type = TT.DEC;

    let val: string = "";
    let isFloat = false;

    if (this.c === "0") {
      val += this.c;
      this.next();

      if ((this.c as string) === "x" || (this.c as string) === "h") {
        // 0xc8, 0hc8
        this.next();
        type = TT.HEX;
      } else if ((this.c as string) === "d") {
        // 0d200
        this.next();
        type = TT.DEC;
      } else if ((this.c as string) === "o" || (this.c as string) === "q") {
        // 0o310, 0q310
        this.next();
        type = TT.OCT;
      } else if ((this.c as string) === "b" || (this.c as string) === "y") {
        // 0b1100_1000, 0y1100_1000
        this.next();
        type = TT.BIN;
      }
    }

    while (NUMBER_EXP.test(this.c)) {
      if (this.c === ".") {
        if (type !== TT.DEC) throw `Syntax Error: Unexpected hex`;
        if (isFloat) break;
        type = TT.FLOAT;
        isFloat = true;
      }
      val += this.c;
      this.next();
    }

    if (type === TT.DEC && val[val.length - 1] === "d") {
      // 0200d
      type = TT.DEC;
      val = val.substring(0, val.length - 1);
    } else if (type === TT.DEC && val[val.length - 1] === "b") {
      // 11001000b, 1100_1000b
      type = TT.BIN;
      val = val.substring(0, val.length - 1);
    } else if (type !== TT.HEX && this.c === "h") {
      // 0c8h
      this.next();
      type = TT.HEX;
    } else if (this.c === "q" || this.c === "o") {
      // 310q, 310o
      this.next();
      type = TT.OCT;
    } else if (this.c === "y") {
      // 1100_1000y
      this.next();
      type = TT.BIN;
    }

    return new Token(type, val, posStart, this.pos);
  }

  private makeSpace(): Token {
    const posStart = this.pos.copy();
    let val: string = "";
    while (
      this.c === " " ||
      this.c === "\t" ||
      this.c === "\r" ||
      this.c === "\n"
    ) {
      val += this.c;
      this.next();
    }
    return new Token(TT.SPACE, val, posStart, this.pos);
  }
}
