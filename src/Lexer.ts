import { SyntaxError } from "./BaseError";
import { KEYWORDS } from "./Keywords";
import { Position } from "./Position";
import { Token, TT } from "./Token";

const DEC_EXP = /[\d\.]/;
const NUMBER_EXP = /[a-f\d\._]/i;
const IDENT_EXP = /[a-z_]/i;
const IDENT_BODY_EXP = /\w/;
const EOF_CHAR = "\0";

const escapeCaracters = {
  n: "\n",
  r: "\r",
  t: "\t",
};

/**
 * 将源码字符串解析为Token表
 */
export class Lexer {
  pos: Position;
  constructor(private text: string) {
    this.pos = new Position(0, 0, 0, text);
  }

  get c(): string {
    if (this.pos.index >= this.text.length) return EOF_CHAR;
    else return this.text[this.pos.index];
  }

  private next() {
    this.pos.next(this.c);
  }

  makeTokens(): Token[] {
    const tokens: Token[] = [];
    let tok: Token;
    while (true) {
      if (tok && tok.is(TT.EOF)) break;
      if (this.c === "$") {
        this.mkTextSpan(tokens);
      } else {
        tok = this.nextToken();
        tokens.push(tok);
      }
    }
    return tokens;
  }

  nextToken(): Token {
    if (DEC_EXP.test(this.c)) {
      return this.mkNumber();
    }

    if (IDENT_EXP.test(this.c)) {
      return this.mkIdent();
    }

    const posStart: Position = this.pos.copy();
    switch (this.c) {
      case EOF_CHAR:
        return new Token(TT.EOF, "EOF", this.pos);

      case " ":
      case "\t":
      case "\r":
      case "\n":
        return this.eatSpace();
      case '"':
      case "'":
        return this.mkString(this.c);
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
        } else if ((this.c as string) === ".") {
          this.next();
          return new Token(TT.OPT_CHAIN, "?.", posStart, this.pos);
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
        } else if ((this.c as string) === "+") {
          this.next();
          return new Token(TT.PPLUS, "++", posStart, this.pos);
        } else {
          return new Token(TT.PLUS, "+", posStart);
        }
      }
      case "-": {
        this.next();
        if ((this.c as string) === "=") {
          this.next();
          return new Token(TT.MINUS_EQ, "-=", posStart, this.pos);
        } else if ((this.c as string) === "-") {
          this.next();
          return new Token(TT.MMINUS, "--", posStart, this.pos);
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
          return this.eatSLComment();
        } else if ((this.c as string) === "*") {
          return this.eatMLComment();
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
        throw new SyntaxError("Invalid or unexpected token", posStart, this.pos).toString();
    }
  }

  mkIdent(): Token {
    const posStart: Position = this.pos.copy();
    let type = TT.IDENTIFIER;
    let val: string = "";
    while (this.c !== EOF_CHAR && IDENT_BODY_EXP.test(this.c)) {
      val += this.c;
      this.next();
    }

    if (KEYWORDS.includes(val)) type = TT.KEYWORD;
    return new Token(type, val, posStart, this.pos);
  }

  mkTextSpan(tokens: Token[]) {
    let posStart = this.pos.copy();
    tokens.push(new Token(TT.LSPAN, "LSPAN", this.pos));
    this.next();

    const startChar = this.c;
    if (startChar !== '"' && startChar !== "'") throw "";
    this.next();

    let val = "";
    let escapeCharacter = false;

    while (this.c !== EOF_CHAR && this.c !== startChar) {
      if (escapeCharacter) {
        val += escapeCaracters[this.c] || this.c;
        escapeCharacter = false;
        this.next();
      }

      if (this.c === "\\") {
        escapeCharacter = true;
        this.next();
        continue;
      } else {
        escapeCharacter = false;
      }

      if (this.c === "{") {
        if (val) {
          tokens.push(new Token(TT.STRING, val, posStart, this.pos));
          val = "";
        }
        this.next();

        while ((this.c as string) !== EOF_CHAR && (this.c as string) !== "}") {
          tokens.push(this.nextToken());
        }
        this.next();
        posStart = this.pos.copy();
      }

      if (this.c === startChar) break;
      val += this.c;
      this.next();
    }

    if (val.length) tokens.push(new Token(TT.STRING, val, posStart, this.pos));
    tokens.push(new Token(TT.RSPAN, "RSPAN", this.pos));
    this.next();
  }

  mkString(c: string): Token {
    const posStart = this.pos.copy();
    let val = "";
    let escapeCharacter = false;

    this.next();
    while (this.c !== EOF_CHAR && (this.c !== c || escapeCharacter)) {
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
  private mkNumber(): Token {
    const posStart = this.pos.copy();
    let type = TT.DEC;

    let val: string = "";
    let isFloat = false;

    // check .23 0r .name
    if (this.c === ".") {
      val += ".";
      this.next();
      if (/\d/.test(this.c)) {
        type = TT.FLOAT;
        while (/\d/.test(this.c) && (this.c as string) !== "\0") {
          val += this.c;
          this.next();
        }
        return new Token(type, val, posStart, this.pos);
      } else {
        type = TT.DOT;
        return new Token(type, val, posStart, this.pos);
      }
    }

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

    while (this.c !== EOF_CHAR && NUMBER_EXP.test(this.c)) {
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

  private eatSpace(): Token {
    while (this.c === " " || this.c === "\t" || this.c === "\r" || this.c === "\n") {
      this.next();
    }
    return this.nextToken();
  }

  // 吃掉单行注释
  private eatSLComment(): Token {
    this.next();
    while (
      (this.c as string) !== "\n" &&
      (this.c as string) !== "\r" &&
      (this.c as string) !== EOF_CHAR
    ) {
      this.next();
    }
    this.next();
    return this.nextToken();
  }
  // 吃掉多行注释
  private eatMLComment(): Token {
    this.next();
    while (this.c !== "\0") {
      if ((this.c as string) === "*") {
        this.next();
        if ((this.c as string) === "/") {
          this.next();
          break;
        }
      }
      this.next();
    }
    return this.nextToken();
  }
}
