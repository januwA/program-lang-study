import { SyntaxError } from "./BaseError";
import { LabelSymbol } from "./Context";
import { KEYWORD, Token, TT, TYPES } from "./Token";

// node type

export enum NT {
  DEC,
  HEX,
  OCT,
  BIN,
  FLOAT,
  BINARY,
  UNARY,
  BOOL,
  NULL,
  VarAssign,
  VarAccess,
  VarDeclare,
  BLOCK,
  IF,
  WHILE,
  FOR,
  JMP,
  LABEL,
  STRING,
}

export abstract class BaseNode {
  static labelCound = 0;
  static GeneratorLabel(): LabelSymbol {
    const name = `label{${BaseNode.labelCound}}`;
    return new LabelSymbol(name);
  }
  abstract toString(): string;
  abstract id(): NT;
}

export class DecNode extends BaseNode {
  value: number;
  id(): NT {
    return NT.DEC;
  }
  toString(): string {
    return this.token.value;
  }
  constructor(public token: Token) {
    super();
    this.value = parseInt(token.value, 10);
  }
}
export class HexNode extends BaseNode {
  value: number;
  id(): NT {
    return NT.HEX;
  }
  toString(): string {
    return this.token.value + "h";
  }
  constructor(public token: Token) {
    super();
    this.value = parseInt(token.value, 16);
  }
}
export class OctNode extends BaseNode {
  value: number;
  id(): NT {
    return NT.OCT;
  }
  toString(): string {
    return this.token.value + "o";
  }
  constructor(public token: Token) {
    super();
    this.value = parseInt(token.value, 8);
  }
}
export class BinNode extends BaseNode {
  value: number;
  id(): NT {
    return NT.BIN;
  }
  toString(): string {
    return this.token.value + "b";
  }
  constructor(public token: Token) {
    super();
    this.value = parseInt(token.value.replace(/_/g, ""), 2);
  }
}
export class FloatNode extends BaseNode {
  value: number;
  id(): NT {
    return NT.FLOAT;
  }
  toString(): string {
    return this.token.value;
  }
  constructor(public token: Token) {
    super();
    this.value = parseFloat(token.value);
  }
}
export class BinaryNode extends BaseNode {
  id(): NT {
    return NT.BINARY;
  }
  toString(): string {
    return `(${this.left.toString()} ${
      this.token.value
    } ${this.right.toString()})`;
  }
  constructor(
    public left: BaseNode,
    public token: Token,
    public right: BaseNode
  ) {
    super();
  }
}
export class UnaryNode extends BaseNode {
  id(): NT {
    return NT.UNARY;
  }
  toString(): string {
    return `${this.token.value}${this.node.toString()}`;
  }
  constructor(public token: Token, public node: BaseNode) {
    super();
  }
}
export class BoolNode extends BaseNode {
  id(): NT {
    return NT.BOOL;
  }
  toString(): string {
    return this.token.value;
  }
  constructor(public token: Token) {
    super();
  }
}
export class NullNode extends BaseNode {
  id(): NT {
    return NT.NULL;
  }
  toString(): string {
    return this.token.value;
  }
  constructor(public token: Token) {
    super();
  }
}
export class StringNode extends BaseNode {
  id(): NT {
    return NT.STRING;
  }
  toString(): string {
    return `"${this.token.value}"`;
  }
  constructor(public token: Token) {
    super();
  }
}

/**
 * 申明变量
 *
 * auto a = 1
 * int a = 1
 * float a = 1.2
 * const auto a = 1
 */
export class VarDeclareNode extends BaseNode {
  id(): NT {
    return NT.VarDeclare;
  }
  toString(): string {
    return `(${this.type.value} ${this.name.value} = ${this.value.toString()})`;
  }
  constructor(
    public isConst: boolean,
    public type: Token,
    public name: Token,
    public value: BaseNode
  ) {
    super();
  }
}

/**
 * 变量赋值
 *
 * a = 1
 * a += 1
 */
export class VarAssignNode extends BaseNode {
  id(): NT {
    return NT.VarAssign;
  }
  toString(): string {
    return `${this.name.value} ${this.operator.value} ${this.value.toString()}`;
  }
  constructor(
    public name: Token,
    public operator: Token,
    public value: BaseNode
  ) {
    super();
  }
}

/**
 * 使用变量
 *
 * a + 1
 */
export class VarAccessNode extends BaseNode {
  id(): NT {
    return NT.VarAccess;
  }
  toString(): string {
    return `${this.name.value}`;
  }
  constructor(public name: Token) {
    super();
  }
}

export class BlockNode extends BaseNode {
  id(): NT {
    return NT.BLOCK;
  }
  toString(): string {
    return `{ ${this.statements
      .map((it) => it.toString())
      .reduce((acc, it) => {
        return acc + it;
      }, "")} }`;
  }
  constructor(public statements: BaseNode[]) {
    super();
  }
}

export class IfNode extends BaseNode {
  id(): NT {
    return NT.IF;
  }
  toString(): string {
    let str = `if (${this.condition.toString()}) ${this.thenNode.toString()}`;

    if (this.elseNode) {
      str += " else " + this.elseNode.toString();
    }
    return str;
  }
  constructor(
    public condition: BaseNode,
    public thenNode: BaseNode,
    public elseNode?: BaseNode
  ) {
    super();
  }
}

export class WhileNode extends BaseNode {
  id(): NT {
    return NT.WHILE;
  }
  toString(): string {
    return `while (${this.condition.toString()}) ${this.bodyNode.toString()}`;
  }
  constructor(public condition: BaseNode, public bodyNode: BaseNode) {
    super();
  }
}

export class ForNode extends BaseNode {
  id(): NT {
    return NT.FOR;
  }
  toString(): string {
    return `for (${this.init.toString()}; ${this.condition.toString()}; ${this.stepNode.toString()}) ${this.bodyNode.toString()}`;
  }
  constructor(
    public init: BaseNode,
    public condition: BaseNode,
    public stepNode: BaseNode,
    public bodyNode: BaseNode
  ) {
    super();
  }
}

// 定义label
export class LabelNode extends BaseNode {
  toString(): string {
    return ``;
  }
  id(): NT {
    return NT.LABEL;
  }
  reWrite(): BaseNode {
    return this;
  }
  constructor(public label: LabelSymbol) {
    super();
  }
}

// 无条件跳转
export class JmpNode extends BaseNode {
  toString(): string {
    return `jmp ${this.label.name}`;
  }
  id(): NT {
    return NT.JMP;
  }
  reWrite(): BaseNode {
    return this;
  }
  constructor(public label: LabelSymbol) {
    super();
  }
}

/**
 * 将token表解析为AST语法树
 */
export class Parser {
  token: Token;
  pos = 0;
  constructor(public tokens: Token[]) {
    this.next();
  }

  parse(): BaseNode {
    if (this.token.is(TT.EOF)) {
      return new NullNode(this.token);
    }

    const result: BaseNode = this.statement();

    if (this.token.type !== TT.EOF) {
      throw new SyntaxError(
        `Unexpected token EOF`,
        this.token.posStart,
        this.token.posEnd
      ).toString();
    }

    return result;
  }

  private next() {
    if (this.pos < this.tokens.length) {
      this.token = this.tokens[this.pos++];
    } else {
      // this.token = this.token;
    }
  }

  private peek(offset: number): Token {
    return this.tokens[this.pos + offset - 1];
  }

  private matchKeywordToken(keyword: string): Token {
    if (this.token.isKeyword(keyword)) {
      const result = this.token;
      this.next();
      return result;
    } else {
      throw new SyntaxError(
        `Unexpected token '${this.token.value}'`,
        this.token.posStart,
        this.token.posEnd
      ).toString();
    }
  }

  private matchToken(type: TT): Token {
    if (this.token.is(type)) {
      const result = this.token;
      this.next();
      return result;
    } else {
      throw new SyntaxError(
        `Unexpected token '${this.token.value}'`,
        this.token.posStart,
        this.token.posEnd
      ).toString();
    }
  }

  /**
   * 获取二元运算符优先级，数字越大权限越高
   *
   * 参考js的
   * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
   */
  private getBinaryOperatorPrecedence(token: Token): number {
    if (token.is(TT.POW)) {
      return 16;
    }

    if (token.is(TT.MUL) || token.is(TT.DIV) || token.is(TT.REMAINDER)) {
      return 15;
    }

    if (token.is(TT.PLUS) || token.is(TT.MINUS)) {
      return 14;
    }

    if (token.is(TT.SHL) || token.is(TT.SHR)) {
      return 13;
    }

    if (
      token.is(TT.LT) ||
      token.is(TT.LTE) ||
      token.is(TT.GT) ||
      token.is(TT.GTE)
    ) {
      return 12;
    }

    if (token.is(TT.EE) || token.is(TT.NE)) {
      return 11;
    }

    if (token.is(TT.BAND)) {
      return 10;
    }

    if (token.is(TT.XOR)) {
      return 9;
    }

    if (token.is(TT.BOR)) {
      return 8;
    }

    if (token.is(TT.AND)) {
      return 7;
    }

    if (token.is(TT.OR)) {
      return 6;
    }

    if (token.is(TT.NULLISH)) {
      return 5;
    }

    if (
      token.is(TT.EQ) ||
      token.is(TT.PLUS_EQ) ||
      token.is(TT.MINUS_EQ) ||
      token.is(TT.MUL_EQ) ||
      token.is(TT.DIV_EQ) ||
      token.is(TT.POW_EQ) ||
      token.is(TT.REMAINDER_EQ) ||
      token.is(TT.SHL_EQ) ||
      token.is(TT.SHR_EQ) ||
      token.is(TT.BAND_EQ) ||
      token.is(TT.BOR_EQ) ||
      token.is(TT.XOR_EQ) ||
      token.is(TT.AND_EQ) ||
      token.is(TT.OR_EQ) ||
      token.is(TT.NULLISH_EQ)
    ) {
      return 3;
    }

    return 0;
  }

  private getUnaryOperatorPrecedence(token: Token): number {
    if (
      token.is(TT.NOT) ||
      token.is(TT.PLUS) ||
      token.is(TT.MINUS) ||
      token.is(TT.BNOT)
    ) {
      return 17;
    }
    return 0;
  }

  private expr(): BaseNode {
    return this.variableAssign();
  }

  private statement() {
    const token = this.token;
    if (token.is(TT.LBLOCK)) {
      return this.blockStatement();
    } else if (token.isKeyword("const")) {
      this.next();
      return this.variableDeclare(true);
    } else if (
      token.isKeyword(TYPES.auto) ||
      token.isKeyword(TYPES.bool) ||
      token.isKeyword(TYPES.int) ||
      token.isKeyword(TYPES.float) ||
      token.isKeyword(TYPES.string)
    ) {
      return this.variableDeclare();
    } else if (token.isKeyword("if")) {
      return this.ifStatement();
    } else if (token.isKeyword("while")) {
      return this.whileStatement();
    } else if (token.isKeyword("for")) {
      return this.forStatement();
    } else {
      return this.expr();
    }
  }

  private blockStatement(): BaseNode {
    this.matchToken(TT.LBLOCK);

    const statements = [];
    while (!this.token.is(TT.RBLOCK)) {
      statements.push(this.statement());
    }
    this.matchToken(TT.RBLOCK);
    return new BlockNode(statements);
  }

  private variableDeclare(isConst = false): BaseNode {
    // auto a = 1
    const type = this.matchToken(TT.KEYWORD);
    const name = this.matchToken(TT.IDENTIFIER);
    this.matchToken(TT.EQ);
    const value = this.expr();
    return new VarDeclareNode(isConst, type, name, value);
  }

  private variableAssign(): BaseNode {
    // a = 1
    const name = this.token;
    if (name.is(TT.IDENTIFIER)) {
      const nextToken = this.peek(1);
      if (
        nextToken.is(TT.EQ) ||
        nextToken.is(TT.PLUS_EQ) ||
        nextToken.is(TT.MINUS_EQ) ||
        nextToken.is(TT.MUL_EQ) ||
        nextToken.is(TT.DIV_EQ) ||
        nextToken.is(TT.POW_EQ) ||
        nextToken.is(TT.REMAINDER_EQ) ||
        nextToken.is(TT.SHL_EQ) ||
        nextToken.is(TT.SHR_EQ) ||
        nextToken.is(TT.BAND_EQ) ||
        nextToken.is(TT.XOR_EQ) ||
        nextToken.is(TT.BOR_EQ) ||
        nextToken.is(TT.AND_EQ) ||
        nextToken.is(TT.OR_EQ) ||
        nextToken.is(TT.NULLISH_EQ)
      ) {
        this.next();
        const operator = this.token;
        this.next();
        const value = this.expr();
        return new VarAssignNode(name, operator, value);
      } else {
        return this.binaryExpr();
      }
    } else {
      return this.binaryExpr();
    }
  }

  private whileStatement(): BaseNode {
    this.matchKeywordToken("while");

    this.matchToken(TT.LPAREN);
    const condition = this.expr();
    this.matchToken(TT.RPAREN);

    const bodyNode = this.statement();
    return new WhileNode(condition, bodyNode);
  }

  private forStatement(): BaseNode {
    this.matchKeywordToken("for");
    this.matchToken(TT.LPAREN);
    const init = this.statement();
    this.matchToken(TT.SEMICOLON);

    const condition = this.expr();
    this.matchToken(TT.SEMICOLON);

    const step = this.expr();
    this.matchToken(TT.RPAREN);

    const bodyNode = this.statement();
    return new ForNode(init, condition, step, bodyNode);
  }

  private ifStatement(): BaseNode {
    this.matchKeywordToken("if");

    this.matchToken(TT.LPAREN);
    const condition = this.expr();
    this.matchToken(TT.RPAREN);

    const thenNode = this.statement();
    let elseNode = null;
    if (this.token.isKeyword("else")) {
      this.next();
      elseNode = this.statement();
    }
    return new IfNode(condition, thenNode, elseNode);
  }

  private binaryExpr(parentPrecedence = 0): BaseNode {
    let left: BaseNode;

    const unaryPrecedence = this.getUnaryOperatorPrecedence(this.token);
    if (unaryPrecedence !== 0 && unaryPrecedence >= parentPrecedence) {
      const token = this.token;
      this.next();
      const _node: BaseNode = this.binaryExpr(unaryPrecedence);
      left = new UnaryNode(token, _node);
    } else {
      left = this.primary();
    }

    while (true) {
      const precedence = this.getBinaryOperatorPrecedence(this.token);
      if (precedence === 0 || precedence <= parentPrecedence) break;

      const t = this.token;
      this.next();
      const right = this.binaryExpr(precedence);
      left = new BinaryNode(left, t, right);
    }
    return left;
  }

  private primary(): BaseNode {
    const token = this.token;
    if (token.is(TT.DEC)) {
      this.next();
      return new DecNode(token);
    } else if (token.is(TT.HEX)) {
      this.next();
      return new HexNode(token);
    } else if (token.is(TT.OCT)) {
      this.next();
      return new OctNode(token);
    } else if (token.is(TT.BIN)) {
      this.next();
      return new BinNode(token);
    } else if (token.is(TT.FLOAT)) {
      this.next();
      return new FloatNode(token);
    } else if (token.is(TT.STRING)) {
      this.next();
      return new StringNode(token);
    } else if (token.is(TT.IDENTIFIER)) {
      this.next();
      return new VarAccessNode(token);
    } else if (token.is(TT.LPAREN)) {
      this.next();
      const _expr = this.expr();
      if (!this.token.is(TT.RPAREN)) {
        throw `Syntax Error: )`;
      }
      this.next();
      return _expr;
    } else if (token.isKeyword("null")) {
      this.next();
      return new NullNode(token);
    } else if (token.isKeyword("true") || token.isKeyword("false")) {
      this.next();
      return new BoolNode(token);
    } else {
      throw new SyntaxError(
        `Unexpected token '${token.value}'`,
        token.posStart,
        token.posEnd
      ).toString();
    }
  }
}
