export enum TT {
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

export class Token {
  constructor(public type: TT, public pos: number, public value: string) { }

  toString() {
    return `${this.type}:${this.value}`;
  }
}
