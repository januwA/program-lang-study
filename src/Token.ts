export enum TT {
  DEC = "DEC", // 十进制
  HEX = "HEX", // 十六进制
  OCT = "OCT", // 八进制
  BIN = "BIN", // 二进制
  FLOAT = "FLOAT", // 浮点数
  SPACE = "SPACE", // " "
  PLUS = "PLUS", // +
  MINUS = "MINUS", // -
  MUL = "MUL", // *
  DIV = "DIV", // /
  LPAREN = "LPAREN", // (
  RPAREN = "RPAREN", // )
  LSQUARE = "LSQUARE", // [
  RSQUARE = "RSQUARE", // ]
  NOT = "NOT", // !
  AND = "AND", // &&
  OR = "OR", // ||
  BAND = "BAND", // &
  BOR = "BOR", // |
  XOR = "XOR", // ^
  LT = "LT", // <
  GT = "GT", // >
  EQ = "EQ", // =
  LTE = "LTE", // <=
  GTE = "GTE", // >=
  EE = "EE", // ==
  NE = "NE", // !=
  POW = "POW", // **
  BNOT = "BNOT", // ~
  REMAINDER = "REMAINDER", // %
  SHL = "SHL", // <<
  SHR = "SHR", // >>
  KEYWORD = "KEYWORD",
  IDENTIFIER = "IDENTIFIER",
  EOF = "EOF",
}

export const KEYWORD = ["true", "false", "null"];

export class Token {
  constructor(public type: TT, public pos: number, public value: string) {}

  toString() {
    return `${this.type}:${this.value}`;
  }

  isKeyword(k: string) {
    return this.type === TT.KEYWORD && this.value === k;
  }

  is(t: TT) {
    return this.type === t;
  }
}
