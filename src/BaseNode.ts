import { LabelSymbol } from "./Context";
import { Token } from "./Token";

// AST Node

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
  CALL,
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
  constructor(public label: LabelSymbol) {
    super();
  }
}

export class CallNode extends BaseNode {
  toString(): string {
    return `${this.name.toString()}(${this.args
      .map((it) => it.toString())
      .toString()})`;
  }
  id(): NT {
    return NT.CALL;
  }
  constructor(public name: BaseNode, public args: BaseNode[]) {
    super();
  }
}