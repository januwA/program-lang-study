import { Token, TT } from "./Token";

/**
 * 将源码字符串解析为Token表
 */
export class Lexer {
  pos: number = 0;
  constructor(private text: string) { }

  get c(): string {
    if (this.pos >= this.text.length)
      return "\0";
    else
      return this.text[this.pos];
  }

  private next() {
    this.pos++;
  }

  makeTokens(): Token[] {
    const tokens: Token[] = [];
    while (this.c !== "\0") {
      tokens.push(this.nextToken());
    }
    tokens.push(new Token(TT.EOF, this.pos, ""));
    return tokens;
  }

  nextToken(): Token {
    if (/\d/.test(this.c)) {
      const posStart = this.pos;
      let val: string = "";
      while (/\d/.test(this.c)) {
        val += this.c;
        this.next();
      }
      return new Token(TT.NUMBER, posStart, val);
    }

    if (this.c === " ") {
      const posStart = this.pos;
      let val: string = "";
      while (this.c === " ") {
        val += this.c;
        this.next();
      }
      return new Token(TT.SPACE, posStart, val);
    }

    if (this.c === "+") {
      return new Token(TT.PLUS, this.pos++, "+");
    }
    if (this.c === "-") {
      return new Token(TT.MINUS, this.pos++, "-");
    }
    if (this.c === "*") {
      return new Token(TT.MUL, this.pos++, "*");
    }
    if (this.c === "/") {
      return new Token(TT.DIV, this.pos++, "/");
    }
    if (this.c === "(") {
      return new Token(TT.LPAREN, this.pos++, "(");
    }
    if (this.c === ")") {
      return new Token(TT.RPAREN, this.pos++, ")");
    }
    if (this.c === "[") {
      return new Token(TT.LSQUARE, this.pos++, "[");
    }
    if (this.c === "]") {
      return new Token(TT.RSQUARE, this.pos++, "]");
    }

    if (this.pos >= this.text.length) {
      return new Token(TT.EOF, this.pos, "");
    }

    throw `Char Error: ${this.c}`;
  }
}
