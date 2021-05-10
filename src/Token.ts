import { Position } from "./Position";

export enum TT {
  DEC = "DEC", // 十进制
  HEX = "HEX", // 十六进制
  OCT = "OCT", // 八进制
  BIN = "BIN", // 二进制
  FLOAT = "FLOAT", // 浮点数
  STRING = "STRING", // 字符串
  SPACE = "SPACE", // " "
  LPAREN = "LPAREN", // (
  RPAREN = "RPAREN", // )
  LBLOCK = "LBLOCK", // {
  RBLOCK = "RBLOCK", // }
  LSQUARE = "LSQUARE", // [
  RSQUARE = "RSQUARE", // ]
  SEMICOLON = "SEMICOLON", // ;
  COLON = "COLON", // :
  QMAKE = "QMAKE", // ?
  COMMA = "COMMA", // ,
  ARROW = "ARROW", // =>
  COMMENT = "COMMENT", // 注释

  // 运算
  PLUS = "PLUS", // +
  MINUS = "MINUS", // -
  MUL = "MUL", // *
  DIV = "DIV", // /
  BAND = "BAND", // &
  BOR = "BOR", // |
  XOR = "XOR", // ^
  POW = "POW", // **
  BNOT = "BNOT", // ~
  REMAINDER = "REMAINDER", // %
  SHL = "SHL", // <<
  SHR = "SHR", // >>
  NULLISH = "NULLISH", // ??

  // 逻辑
  NOT = "NOT", // !
  LT = "LT", // <
  GT = "GT", // >
  LTE = "LTE", // <=
  GTE = "GTE", // >=
  EE = "EE", // ==
  NE = "NE", // !=
  AND = "AND", // &&
  OR = "OR", // ||

  // 赋值
  EQ = "EQ", // =
  PLUS_EQ = "PLUS_EQ", // +=
  MINUS_EQ = "MINUS_EQ", // -=
  MUL_EQ = "MUL_EQ", // *=
  DIV_EQ = "DIV_EQ", // /=
  POW_EQ = "POW_EQ", // **=
  REMAINDER_EQ = "REMAINDER_EQ", // %=
  SHL_EQ = "SHL_EQ", // <<=
  SHR_EQ = "SHR_EQ", // >>=
  BAND_EQ = "BAND_EQ", // &=
  BOR_EQ = "BOR_EQ", // |=
  XOR_EQ = "XOR_EQ", // ^=
  AND_EQ = "AND_EQ", // &&=
  OR_EQ = "OR_EQ", // ||=
  NULLISH_EQ = "NULLISH_EQ", // ??=

  KEYWORD = "KEYWORD",
  IDENTIFIER = "IDENTIFIER",
  EOF = "EOF",
}

export class Token {
  constructor(
    public type: TT,
    public value: string,
    public posStart: Position,
    public posEnd?: Position
  ) {
    this.posStart = posStart.copy();
    if (posEnd) {
      this.posEnd = posEnd.copy();
    } else {
      this.posEnd = posStart.copy();
      this.posEnd!.next("");
    }
  }

  toString() {
    return `${this.type}:${this.value}`;
  }

  is(t: TT) {
    return this.type === t;
  }
}
