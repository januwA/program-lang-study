import { Token, TT } from "./Token";

export abstract class BaseNode {}

export class NumberNode extends BaseNode {
  constructor(public token: Token) {
    super();
  }
}

export class BinaryNode extends BaseNode {
  constructor(
    public left: BaseNode,
    public token: Token,
    public right: BaseNode
  ) {
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

  next() {
    if (this.pos < this.tokens.length) {
      this.token = this.tokens[this.pos++];
    } else {
      // this.token = this.token;
    }
  }

  parse(): BaseNode {
    const result = this.expr();

    if (this.token.type !== TT.EOF) {
      throw `Syntax Error: EOF ${this.token}`;
    }

    return result;
  }

  private expr(): BaseNode {
    let left: BaseNode = this.term();

    while (this.token.type === TT.PLUS || this.token.type === TT.MINUS) {
      const t = this.token;
      this.next();
      const right = this.term();
      left = new BinaryNode(left, t, right);
    }

    return left;
  }

  private term(): BaseNode {
    let left: BaseNode = this.factor();

    while (this.token.type === TT.MUL || this.token.type === TT.DIV) {
      const t = this.token;
      this.next();
      const right = this.factor();
      left = new BinaryNode(left, t, right);
    }

    return left;
  }

  private factor(): BaseNode {
    const token = this.token;
    if (this.token.type === TT.NUMBER) {
      this.next();
      return new NumberNode(token);
    } else if (this.token.type === TT.LPAREN) {
      this.next();
      const _expr = this.expr();
      if ((this.token.type as string) !== TT.RPAREN) {
        throw `Syntax Error: RPAREN ${this.token}`;
      }
      this.next();
      return _expr;
    } else {
      throw `Syntax Error: TOKEN ${this.token}`;
    }
  }
}
