import { SyntaxError } from "./BaseError";
import { Position } from "./Position";
import { KEYWORD, Token, TT } from "./Token";

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
}

export abstract class BaseNode {
  constructor(public posStart: Position, public posEnd: Position) {}
  abstract toString(): string;
  abstract id(): NT;
}

export class DecNode extends BaseNode {
  id(): NT {
    return NT.DEC;
  }
  toString(): string {
    return this.token.value;
  }
  constructor(public token: Token) {
    super(token.posStart, token.posEnd);
  }
}
export class HexNode extends BaseNode {
  id(): NT {
    return NT.HEX;
  }
  toString(): string {
    return this.token.value;
  }
  constructor(public token: Token) {
    super(token.posStart, token.posEnd);
  }
}

export class OctNode extends BaseNode {
  id(): NT {
    return NT.OCT;
  }
  toString(): string {
    return this.token.value;
  }
  constructor(public token: Token) {
    super(token.posStart, token.posEnd);
  }
}

export class BinNode extends BaseNode {
  id(): NT {
    return NT.BIN;
  }
  toString(): string {
    return this.token.value;
  }
  constructor(public token: Token) {
    super(token.posStart, token.posEnd);
  }
}

export class FloatNode extends BaseNode {
  id(): NT {
    return NT.FLOAT;
  }
  toString(): string {
    return this.token.value;
  }
  constructor(public token: Token) {
    super(token.posStart, token.posEnd);
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
    super(left.posStart, right.posEnd);
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
    super(token.posStart, node.posEnd);
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
    super(token.posStart, token.posEnd);
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
    super(token.posStart, token.posEnd);
  }
}

/**
 * 申明变量
 *
 * auto a = 1
 * int a = 1
 * float a = 1.2
 */
export class VarDeclareNode extends BaseNode {
  id(): NT {
    return NT.VarDeclare;
  }
  toString(): string {
    return `(${this.type.value} ${this.name.value} = ${this.value.toString()})`;
  }
  constructor(
    public type: Token,
    public name: Token,
    public eq: Token,
    public value: BaseNode
  ) {
    super(type.posStart, value.posEnd);
  }
}

/**
 * 变量赋值
 *
 * a = 1
 * a += 1
 *
 * ident EQ expr
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
    super(name.posStart, value.posEnd);
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
    super(name.posStart, name.posEnd);
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
  constructor(
    public start: Token,
    public statements: BaseNode[],
    public end: Token
  ) {
    super(start.posStart, end.posEnd);
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
    public ifKeyword: Token,
    public condition: BaseNode,
    public thenNode: BaseNode,
    public elseNode?: BaseNode
  ) {
    super(ifKeyword.posStart, elseNode ? elseNode.posEnd : thenNode.posEnd);
  }
}

export class WhileNode extends BaseNode {
  id(): NT {
    return NT.WHILE;
  }
  toString(): string {
    return `while (${this.condition.toString()}) ${this.bodyNode.toString()}`;
  }
  constructor(
    public whileKeyword: Token,
    public condition: BaseNode,
    public bodyNode: BaseNode
  ) {
    super(whileKeyword.posStart, bodyNode.posEnd);
  }
}

export class ForNode extends BaseNode {
  id(): NT {
    return NT.FOR;
  }
  toString(): string {
    return `for (${this.condition.toString()}) ${this.bodyNode.toString()}`;
  }
  constructor(
    public forKeyword: Token,
    public init: BaseNode,
    public condition: BaseNode,
    public stepNode: BaseNode,
    public bodyNode: BaseNode
  ) {
    super(forKeyword.posStart, bodyNode.posEnd);
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
        `Unexpected token '${this.token.value}'`,
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
      token.is(TT.OR_EQ)
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
    } else if (token.isKeyword("auto")) {
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
    const start = this.matchToken(TT.LBLOCK);

    const statements = [];
    while (!this.token.is(TT.RBLOCK)) {
      statements.push(this.statement());
    }

    const end = this.matchToken(TT.RBLOCK);
    return new BlockNode(start, statements, end);
  }

  private variableDeclare(): BaseNode {
    // auto a = 1
    const type = this.matchToken(TT.KEYWORD);
    const name = this.matchToken(TT.IDENTIFIER);
    const eq = this.matchToken(TT.EQ);
    const value = this.expr();
    return new VarDeclareNode(type, name, eq, value);
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
        nextToken.is(TT.OR_EQ)
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
    const keyword = this.matchKeywordToken("while");

    this.matchToken(TT.LPAREN);
    const condition = this.expr();
    this.matchToken(TT.RPAREN);

    const bodyNode = this.statement();
    return new WhileNode(keyword, condition, bodyNode);
  }

  private forStatement(): BaseNode {
    const keyword = this.matchKeywordToken("for");
    this.matchToken(TT.LPAREN);
    const init = this.statement();
    this.matchToken(TT.SEMICOLON);

    const condition = this.expr();
    this.matchToken(TT.SEMICOLON);

    const step = this.expr();
    this.matchToken(TT.RPAREN);

    const bodyNode = this.statement();
    return new ForNode(keyword, init, condition, step, bodyNode);
  }

  private ifStatement(): BaseNode {
    const keyword = this.matchKeywordToken("if");

    this.matchToken(TT.LPAREN);
    const condition = this.expr();
    this.matchToken(TT.RPAREN);

    const thenNode = this.statement();
    let elseNode = null;
    if (this.token.isKeyword("else")) {
      this.next();
      elseNode = this.statement();
    }
    return new IfNode(keyword, condition, thenNode, elseNode);
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
