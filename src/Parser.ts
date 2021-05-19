import { SyntaxError } from "./BaseError";
import {
  AtIndexNode,
  AtKeyNode,
  BaseNode,
  BinaryNode,
  BinNode,
  BlockNode,
  BlockType,
  BoolNode,
  BreakNode,
  CallNode,
  ContinueNode,
  DecNode,
  FloatNode,
  ForNode,
  FunNode,
  FunParam,
  HexNode,
  IfNode,
  ListNode,
  MapNode,
  MemberNode,
  NullNode,
  OctNode,
  RetNode,
  StringNode,
  TernaryNode,
  TextSpanNode,
  UnaryNode,
  VarAccessNode,
  VarDeclareNode,
  WhileNode,
} from "./BaseNode";
import { KEYWORDS, Keyword } from "./Keywords";
import { Token, TT } from "./Token";

export const INVALID_BINARY_OP = -1;
export const SKIP_COMMA_PRECEDENCE = 1;

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
    return this.tokens[this.pos + offset - 1] ?? null;
  }

  private matchKeywordToken(keyword: string): Token {
    if (this.token.is(TT.KEYWORD) && KEYWORDS.includes(this.token.value)) {
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

    if (token.isOr([TT.MUL, TT.DIV, TT.REMAINDER])) {
      return 15;
    }

    if (token.isOr([TT.PLUS, TT.MINUS])) {
      return 14;
    }

    if (token.isOr([TT.SHL, TT.SHR])) {
      return 13;
    }

    if (token.isOr([TT.LT, TT.LTE, TT.GT, TT.GTE])) {
      return 12;
    }

    if (token.isOr([TT.EE, TT.NE])) {
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
      token.isOr([
        TT.EQ,
        TT.PLUS_EQ,
        TT.MINUS_EQ,
        TT.MUL_EQ,
        TT.DIV_EQ,
        TT.POW_EQ,
        TT.REMAINDER_EQ,
        TT.SHL_EQ,
        TT.SHR_EQ,
        TT.BAND_EQ,
        TT.XOR_EQ,
        TT.BOR_EQ,
        TT.AND_EQ,
        TT.OR_EQ,
        TT.NULLISH_EQ,
      ])
    ) {
      return 3;
    }

    if (token.is(TT.COMMA)) {
      return 0;
    }

    return INVALID_BINARY_OP;
  }

  private getUnaryOperatorPrecedence(token: Token): number {
    if (token.isOr([TT.NOT, TT.PLUS, TT.MINUS, TT.BNOT, TT.PPLUS, TT.MMINUS])) {
      return 17;
    }

    if (
      token.is(TT.LPAREN) &&
      this.peek(1).is(TT.IDENTIFIER) &&
      this.peek(2).is(TT.RPAREN)
    ) {
      return 17;
    }
    return INVALID_BINARY_OP;
  }

  parse(): BaseNode {
    if (this.token.is(TT.EOF)) return new NullNode(this.token);

    const result: BaseNode = this.member();

    if (!this.token.is(TT.EOF)) {
      throw new SyntaxError(
        `Unexpected token EOF`,
        this.token.posStart,
        this.token.posEnd
      ).toString();
    }

    return result;
  }

  private member(): BaseNode {
    const statements: BaseNode[] = [];
    while (!this.token.is(TT.EOF)) {
      statements.push(this.statement());
    }
    return new MemberNode(statements);
  }

  private statement(): BaseNode {
    let result: BaseNode = null;
    const token = this.token;
    if (token.is(TT.LBLOCK)) {
      result = this.block();
    } else if (token.is(TT.KEYWORD)) {
      switch (token.value) {
        case Keyword.const:
          this.next();
          result = this.varDeclare(true);
          break;
        case Keyword.if:
          result = this.ifStatement();
          break;
        case Keyword.while:
          result = this.whileStatement();
          break;
        case Keyword.for:
          result = this.forStatement();
          break;
        case Keyword.ret:
          result = this.retStatement();
          break;
        case Keyword.continue:
          result = this.continueStatement();
          break;
        case Keyword.break:
          result = this.breakStatement();
          break;
        default:
          result = this.expr();
      }
    } else if (token.is(TT.IDENTIFIER) && this.peek(1)?.is(TT.IDENTIFIER)) {
      // int a = 1
      // int add() => 1
      result = this.peek(2)?.is(TT.LPAREN) ? this.fun() : this.varDeclare();
    } else {
      result = this.expr();
    }

    while (this.token.is(TT.SEMICOLON)) this.next();
    return result;
  }

  private fun(): BaseNode {
    const type = this.matchToken(TT.IDENTIFIER);
    const name = this.matchToken(TT.IDENTIFIER);
    const params: FunParam[] = [];
    this.matchToken(TT.LPAREN);
    if (this.token.is(TT.RPAREN)) {
      this.next();
    } else {
      params.push(this._getFunParamItem());

      while (this.token.is(TT.COMMA)) {
        this.next();
        params.push(this._getFunParamItem());
      }

      this.matchToken(TT.RPAREN);
    }

    let body: BaseNode = null;
    if (this.token.is(TT.LBLOCK)) {
      // block 函数
      body = this.block(BlockType.fun);
    } else if (this.token.is(TT.ARROW)) {
      // 箭头函数
      this.next();
      body = this.expr();
    }
    return new FunNode(type.value, name, params, body);
  }

  private _getFunParamItem(): FunParam {
    let isConst = false;
    if (this.token.is(TT.KEYWORD) && this.token.value === Keyword.const) {
      this.next();
      isConst = true;
    }
    const type = this.matchToken(TT.IDENTIFIER);
    const name = this.matchToken(TT.IDENTIFIER);

    return {
      isConst: isConst,
      type: type.value,
      name: name.value,
    };
  }

  private retStatement() {
    const retRow = this.token.posStart.row;
    this.matchKeywordToken(Keyword.ret);
    const valueToken = this.token;
    let value: BaseNode = null;

    // ret 1

    // ret
    // 1
    if (retRow === valueToken.posStart.row) value = this.expr();
    return new RetNode(value);
  }

  private continueStatement() {
    this.matchKeywordToken(Keyword.continue);
    return new ContinueNode();
  }

  private breakStatement() {
    this.matchKeywordToken(Keyword.break);
    return new BreakNode();
  }

  private block(type: BlockType = BlockType.default): BaseNode {
    this.matchToken(TT.LBLOCK);

    const statements = [];
    while (!this.token.is(TT.RBLOCK)) {
      statements.push(this.statement());
    }
    this.matchToken(TT.RBLOCK);
    return new BlockNode(statements, type);
  }

  private varDeclare(isConst = false): BaseNode {
    // auto a = 1
    // auto a = 1, b = 2;
    // auto a,b,c;
    // https://en.wikipedia.org/wiki/Comma_operator
    const type = this.matchToken(TT.IDENTIFIER);

    const items: { name: Token; value: BaseNode | null }[] = [];

    let name = this.matchToken(TT.IDENTIFIER);
    let value = null;

    if (this.token.is(TT.EQ)) {
      this.next();
      value = this.expr(SKIP_COMMA_PRECEDENCE);
    }
    items.push({ name, value });

    while (this.token.is(TT.COMMA)) {
      this.next();
      name = this.matchToken(TT.IDENTIFIER);
      if (this.token.is(TT.EQ)) {
        this.next();
        value = this.expr(SKIP_COMMA_PRECEDENCE);
      } else {
        value = null;
      }
      items.push({ name, value });
    }

    return new VarDeclareNode(isConst, type, items);
  }

  private whileStatement(): BaseNode {
    this.matchKeywordToken(Keyword.while);

    this.matchToken(TT.LPAREN);
    const condition = this.expr();
    this.matchToken(TT.RPAREN);

    const bodyNode = this.statement();
    return new WhileNode(condition, bodyNode);
  }

  private forStatement(): BaseNode {
    this.matchKeywordToken(Keyword.for);
    this.matchToken(TT.LPAREN);
    const init = this.varDeclare();
    this.matchToken(TT.SEMICOLON);

    const condition = this.expr();
    this.matchToken(TT.SEMICOLON);

    const step = this.expr();
    this.matchToken(TT.RPAREN);

    const bodyNode = this.statement();
    return new ForNode(init, condition, step, bodyNode);
  }

  private ifStatement(): BaseNode {
    this.matchKeywordToken(Keyword.if);

    const cases: { condition: BaseNode; then: BaseNode }[] = [];

    this.matchToken(TT.LPAREN);
    const condition = this.expr();
    this.matchToken(TT.RPAREN);
    const thenNode = this.statement();
    cases.push({
      condition: condition,
      then: thenNode,
    });

    while (this.token.value === Keyword.elif) {
      this.next();
      this.matchToken(TT.LPAREN);
      const condition = this.expr();
      this.matchToken(TT.RPAREN);
      const thenNode = this.statement();
      cases.push({
        condition: condition,
        then: thenNode,
      });
    }

    let elseNode = null;
    if (this.token.value === Keyword.else) {
      this.next();
      elseNode = this.statement();
    }
    return new IfNode(cases, elseNode);
  }

  private expr(parentPrecedence = INVALID_BINARY_OP): BaseNode {
    let left = this.binaryExpr(parentPrecedence);
    if (this.token.is(TT.QMAKE)) {
      left = this.ternaryExpr(left);
    }
    return left;
  }

  /**
   * 三元表达式
   * <expr> ? <expr> : <expr>
   */
  private ternaryExpr(condition: BaseNode) {
    this.matchToken(TT.QMAKE);
    const thenNode = this.expr();
    this.matchToken(TT.COLON);
    const elseNode = this.expr();
    return new TernaryNode(condition, thenNode, elseNode);
  }

  private binaryExpr(
    parentPrecedence = INVALID_BINARY_OP,
    lr = true // 默认从左到右
  ): BaseNode {
    let left: BaseNode;

    const unaryPrecedence = this.getUnaryOperatorPrecedence(this.token);
    if (
      unaryPrecedence !== INVALID_BINARY_OP &&
      unaryPrecedence >= parentPrecedence
    ) {
      left = this.unaryExpr(unaryPrecedence);
    } else {
      left = this.atom();

      if (this.token.isOr([TT.PPLUS, TT.MMINUS])) {
        // 后置运算 a++ a--
        const op = this.token;
        this.next();
        left = new UnaryNode(op, left, true);
      } else {
        left = this.propExpr(left);
      }
    }

    while (true) {
      const precedence = this.getBinaryOperatorPrecedence(this.token);
      if (precedence === INVALID_BINARY_OP) break;

      if (lr ? precedence <= parentPrecedence : precedence < parentPrecedence)
        break;

      const op = this.token;
      this.next();
      const right = this.binaryExpr(precedence, precedence !== 3);
      left = new BinaryNode(left, op, right);
    }
    return left;
  }

  private propExpr(left: BaseNode): BaseNode {
    let change: boolean = false;
    // … ( … )
    while (this.token.is(TT.LPAREN)) {
      change = true;
      left = this.call(left);
    }

    // … [ … ]
    while (this.token.is(TT.LSQUARE)) {
      change = true;
      left = this.atIndex(left);
    }

    // … . …
    while (this.token.is(TT.DOT)) {
      change = true;
      left = this.atKey(left, TT.DOT);
    }

    // … ?. …
    while (this.token.is(TT.OPT_CHAIN)) {
      change = true;
      left = this.atKey(left, TT.OPT_CHAIN);
    }

    return change ? this.propExpr(left) : left;
  }

  private atKey(left: BaseNode, type: TT): BaseNode {
    const op = this.matchToken(type);
    const key = this.matchToken(TT.IDENTIFIER);
    return new AtKeyNode(left, op, key);
  }

  private call(name: BaseNode): BaseNode {
    this.matchToken(TT.LPAREN);
    const args: BaseNode[] = [];
    if (this.token.is(TT.RPAREN)) {
      this.next();
    } else {
      this._itemExpres(args);
      this.matchToken(TT.RPAREN);
    }

    return new CallNode(name, args);
  }

  private atIndex(left: BaseNode): BaseNode {
    this.matchToken(TT.LSQUARE);
    const index = this.expr();
    this.matchToken(TT.RSQUARE);
    return new AtIndexNode(left, index);
  }

  private unaryExpr(unaryPrecedence: number): BaseNode {
    const op = this.token;
    if (op.is(TT.LPAREN)) {
      this.matchToken(TT.LPAREN);
      const conversionType = this.matchToken(TT.IDENTIFIER);
      this.matchToken(TT.RPAREN);
      const _node: BaseNode = this.binaryExpr(unaryPrecedence);
      return new UnaryNode(conversionType, _node);
    } else {
      this.next();
      const _node: BaseNode = this.binaryExpr(unaryPrecedence);
      return new UnaryNode(op, _node);
    }
  }

  private atom(): BaseNode {
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
    } else if (token.is(TT.LSPAN)) {
      this.next();
      const nodes: BaseNode[] = [];
      while (!this.token.is(TT.RSPAN)) {
        nodes.push(this.expr());
      }
      this.next();
      return new TextSpanNode(nodes);
    } else if (token.is(TT.IDENTIFIER)) {
      this.next();
      return new VarAccessNode(token);
    } else if (token.is(TT.KEYWORD)) {
      switch (token.value) {
        case Keyword.null:
          this.next();
          return new NullNode(token);
        case Keyword.map:
          return this.mapExpr();
        case Keyword.true:
        case Keyword.false:
          this.next();
          return new BoolNode(token);
        default:
          throw `Wrong keyword ${token.value}`;
      }
    } else if (token.is(TT.LPAREN)) {
      this.next();
      const _expr = this.expr();
      this.matchToken(TT.RPAREN);
      return _expr;
    } else if (token.is(TT.LSQUARE)) {
      return this.listExpr();
    } else {
      throw new SyntaxError(
        `Unexpected token '${token.value}'`,
        token.posStart,
        token.posEnd
      ).toString();
    }
  }

  /**
   * List 表达式
   */
  listExpr(): BaseNode {
    this.matchToken(TT.LSQUARE);
    const items: BaseNode[] = [];
    if (this.token.is(TT.RSQUARE)) {
      this.next();
    } else {
      this._itemExpres(items);
      this.matchToken(TT.RSQUARE);
    }
    return new ListNode(items);
  }

  /**
   * Map 表达式
   */
  mapExpr(): BaseNode {
    this.matchKeywordToken(Keyword.map);
    this.matchToken(TT.LBLOCK);

    const map: { key: BaseNode; value: BaseNode }[] = [];
    if (this.token.is(TT.RBLOCK)) {
      this.next();
    } else {
      let key: BaseNode, value: BaseNode;
      while (!this.token.is(TT.RBLOCK)) {
        key = this.expr(SKIP_COMMA_PRECEDENCE);
        this.matchToken(TT.COLON);
        value = this.expr(SKIP_COMMA_PRECEDENCE);
        if (!this.token.is(TT.RBLOCK)) {
          this.matchToken(TT.COMMA);
        }
        map.push({ key, value });
      }
      this.next();
    }

    return new MapNode(map);
  }

  private _itemExpres(items: BaseNode[]): BaseNode[] {
    // 传入1跳过 COMMA 二元表达式
    items.push(this.expr(SKIP_COMMA_PRECEDENCE));
    while (this.token.is(TT.COMMA)) {
      this.next();
      items.push(this.expr(SKIP_COMMA_PRECEDENCE));
    }
    return items;
  }
}
