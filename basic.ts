enum TokenType {
  NUMBER = "NUMBER",
  SPACE = "SPACE",
  PLUS = "PLUS",
  MINUS = "MINUS",
  MUL = "MUL",
  DIV = "DIV",
  LPAREN = "LPAREN",
  RPAREN = "RPAREN",
  LSQUARE = "LSQUARE",
  RSQUARE = "RSQUARE",
  EOF = "EOF",
}

class Token {
  constructor(
    public type: TokenType,
    public pos: number,
    public value: string
  ) {}

  toString() {
    return `${this.type}:${this.value}`;
  }
}

class Lexer {
  pos: number = 0;
  constructor(private text: string) {}

  get c(): string {
    if (this.pos >= this.text.length) return "\0";
    else return this.text[this.pos];
  }

  private next() {
    this.pos++;
  }

  makeTokens(): Token[] {
    const tokens: Token[] = [];
    while (this.c !== "\0") {
      tokens.push(this.nextToken());
    }
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
      return new Token(TokenType.NUMBER, posStart, val);
    }

    if (this.c === " ") {
      const posStart = this.pos;
      let val: string = "";
      while (this.c === " ") {
        val += this.c;
        this.next();
      }
      return new Token(TokenType.SPACE, posStart, val);
    }

    if (this.c === "+") {
      return new Token(TokenType.PLUS, this.pos++, "+");
    }
    if (this.c === "-") {
      return new Token(TokenType.MINUS, this.pos++, "-");
    }
    if (this.c === "*") {
      return new Token(TokenType.MUL, this.pos++, "*");
    }
    if (this.c === "/") {
      return new Token(TokenType.DIV, this.pos++, "/");
    }
    if (this.c === ")") {
      return new Token(TokenType.LPAREN, this.pos++, "(");
    }
    if (this.c === "(") {
      return new Token(TokenType.RPAREN, this.pos++, ")");
    }
    if (this.c === "[") {
      return new Token(TokenType.LSQUARE, this.pos++, "[");
    }
    if (this.c === "]") {
      return new Token(TokenType.RSQUARE, this.pos++, "]");
    }

    if (this.pos >= this.text.length) {
      return new Token(TokenType.EOF, this.pos, "");
    }

    throw `Char Error: ${this.c}`;
  }
}

export function run(text: string) {
  const lexer = new Lexer(text);
  const tokens = lexer.makeTokens();
  console.log(tokens.map((it) => it.toString()));
}
