import { SyntaxError } from "./BaseError";
import {
  BaseNode,
  BinaryNode,
  BinNode,
  BlockNode,
  BlockType,
  BoolNode,
  CallNode,
  DecNode,
  FloatNode,
  ForNode,
  FunNode,
  FunParam,
  HexNode,
  IfNode,
  MemberNode,
  NullNode,
  OctNode,
  StringNode,
  UnaryNode,
  VarAccessNode,
  VarAssignNode,
  VarDeclareNode,
  WhileNode,
} from "./BaseNode";
import { KEYWORD, Token, TT, TYPES } from "./Token";

/**
 * 将token表解析为AST语法树
 */
export class Parser {
  token: Token;
  pos = 0;
  constructor(public tokens: Token[]) {
    this.next();
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

  parse(): BaseNode {
    if (this.token.is(TT.EOF)) return new NullNode(this.token);

    const result: BaseNode = this.members();

    if (!this.token.is(TT.EOF)) {
      throw new SyntaxError(
        `Unexpected token EOF`,
        this.token.posStart,
        this.token.posEnd
      ).toString();
    }

    return result;
  }

  private members(): BaseNode {
    const statements: BaseNode[] = [];
    while (!this.token.is(TT.EOF)) {
      statements.push(this.member());
    }
    return new MemberNode(statements);
  }

  private member(): BaseNode {
    const token = this.token;
    if (token.isKeyword(TYPES.fun)) {
      return this.fun();
    }

    return this.statement();
  }

  private fun(): BaseNode {
    this.matchKeywordToken(TYPES.fun);
    const returnType = this.token;
    this.next();

    const name = this.matchToken(TT.IDENTIFIER);
    const params: FunParam[] = [];
    this.matchToken(TT.LPAREN);
    if (this.token.is(TT.RPAREN)) {
      this.next();
    } else {
      const type = this.token;
      this.next();
      const name = this.matchToken(TT.IDENTIFIER);

      params.push({
        type: type.value,
        name: name.value,
      });

      while (this.token.is(TT.COMMA)) {
        this.next();
        const type = this.token;
        this.next();
        const name = this.matchToken(TT.IDENTIFIER);
        params.push({
          type: type.value,
          name: name.value,
        });
      }

      this.matchToken(TT.RPAREN);
    }

    let body: BaseNode = null;
    if (this.token.is(TT.LBLOCK)) {
      // block 函数
      body = this.blockStatement(BlockType.fun);
    } else if (this.token.is(TT.ARROW)) {
      // 箭头函数
      this.next();
      body = this.expr();
    }
    return new FunNode(returnType.value, name, params, body);
  }

  private statement(): BaseNode {
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

  private blockStatement(type: BlockType = BlockType.default): BaseNode {
    this.matchToken(TT.LBLOCK);

    const statements = [];
    while (!this.token.is(TT.RBLOCK)) {
      statements.push(this.statement());
    }
    this.matchToken(TT.RBLOCK);
    return new BlockNode(statements, type);
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
      const atom = this.primary();

      // call
      if (this.token.is(TT.LPAREN)) {
        this.next();
        const args: BaseNode[] = [];
        if (this.token.is(TT.RPAREN)) {
          this.next();
        } else {
          args.push(this.binaryExpr());
          while (this.token.is(TT.COMMA)) {
            this.next();
            args.push(this.binaryExpr());
          }
          this.matchToken(TT.RPAREN);
        }

        left = new CallNode(atom, args);
      } else {
        left = atom;
      }
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
      const t0 = this.peek(0);
      const t1 = this.peek(1);
      if (
        t1.is(TT.RPAREN) &&
        (t0.isKeyword(TYPES.bool) ||
          t0.isKeyword(TYPES.int) ||
          t0.isKeyword(TYPES.float) ||
          t0.isKeyword(TYPES.string) ||
          t0.isKeyword(TYPES.Null) ||
          t0.isKeyword(TYPES.fun))
      ) {
        const conversionType = this.token;
        this.next();
        this.matchToken(TT.RPAREN);
        return new UnaryNode(conversionType, this.expr());
      } else {
        const _expr = this.expr();
        this.matchToken(TT.RPAREN);
        return _expr;
      }
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
