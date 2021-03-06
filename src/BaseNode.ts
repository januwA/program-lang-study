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
  FUN,
  MEMBER,
  RET,
  CONTINUE,
  BREAK,
  TEXT_SPAN,
  TERNARY,
  LIST,
  MAP,
  AT_INDEX,
  AT_KEY,
}

export abstract class BaseNode {
  static labelCound = 0;
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
      this.operator.value
    } ${this.right.toString()})`;
  }
  constructor(
    public left: BaseNode,
    public operator: Token,
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
    return `(${this.op.value})${this.node.toString()}`;
  }
  constructor(
    public op: Token,
    public node: BaseNode,
    public postOp: boolean = false // ????????????(????????????????????????)
  ) {
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

export class TextSpanNode extends BaseNode {
  id(): NT {
    return NT.TEXT_SPAN;
  }
  toString(): string {
    let text = "";
    for (const t of this.nodes) {
      if (t.id() === NT.STRING) {
        text += t.toString();
      } else {
        text += `{${t.toString()}}`;
      }
    }
    return `$"${text}"`;
  }
  constructor(public nodes: BaseNode[]) {
    super();
  }
}

/**
 * ????????????
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
    let str = `${this.isConst ? "const" : ""} ${this.type.value}`;
    for (const it of this.items) {
      str += it.value
        ? `${it.name.value} = ${it.value.toString()}`
        : `${it.name.value}`;
    }
    return str;
  }
  constructor(
    public isConst: boolean,
    public type: Token,
    public items: { name: Token; value: BaseNode | null }[]
  ) {
    super();
  }
}

/**
 * ????????????
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

export enum BlockType {
  default,
  fun,
  controlFlow,
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
  constructor(public statements: BaseNode[], public blockType: BlockType) {
    super();
  }
}

export class MemberNode extends BaseNode {
  id(): NT {
    return NT.MEMBER;
  }
  toString(): string {
    return `${this.statements
      .map((it) => it.toString() + ";")
      .reduce((acc, it) => {
        return acc + it;
      }, "")}`;
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
    let str = ``;

    for (let i = 0; i < this.cases.length; i++) {
      const it = this.cases[i];
      str += `${
        i === 0 ? "if" : "elif"
      } (${it.condition.toString()}) ${it.then.toString()}`;
    }

    if (this.elseNode) {
      str += " else " + this.elseNode.toString();
    }
    return str;
  }
  constructor(
    public cases: { condition: BaseNode; then: BaseNode }[],
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

export interface FunParam {
  isConst: boolean;
  type: string;
  name: string;
}

export class FunNode extends BaseNode {
  toString(): string {
    return `${this.returnType} ${this.name.value}(${this.params
      .map((it) => `${it.type} ${it.name}`)
      .toString()}) ${this.body.toString()}`;
  }
  id(): NT {
    return NT.FUN;
  }
  constructor(
    public returnType: string,
    public name: Token,
    public params: FunParam[],
    public body: BaseNode
  ) {
    super();
  }
}

export class RetNode extends BaseNode {
  toString(): string {
    return `ret ${this.value?.toString()}`;
  }
  id(): NT {
    return NT.RET;
  }

  constructor(public value?: BaseNode) {
    super();
  }
}

export class ContinueNode extends BaseNode {
  toString(): string {
    return `continue`;
  }
  id(): NT {
    return NT.CONTINUE;
  }

  constructor() {
    super();
  }
}

export class BreakNode extends BaseNode {
  toString(): string {
    return `break`;
  }
  id(): NT {
    return NT.BREAK;
  }

  constructor() {
    super();
  }
}

export class TernaryNode extends BaseNode {
  toString(): string {
    return `${this.condition.toString()}?${this.thenNode.toString()}:${this.elseNode.toString()}`;
  }
  id(): NT {
    return NT.TERNARY;
  }

  constructor(
    public condition: BaseNode,
    public thenNode: BaseNode,
    public elseNode: BaseNode
  ) {
    super();
  }
}

export class ListNode extends BaseNode {
  toString(): string {
    return `[${this.items.map((n) => n.toString()).toString()}]`;
  }
  id(): NT {
    return NT.LIST;
  }

  constructor(public items: BaseNode[]) {
    super();
  }
}

export class MapNode extends BaseNode {
  toString(): string {
    let str = "";
    for (const it of this.map) {
      str += `${it.key.toString()}:${it.value.toString()},`;
    }
    return `{}`;
  }
  id(): NT {
    return NT.MAP;
  }

  constructor(public map: { key: BaseNode; value: BaseNode }[]) {
    super();
  }
}

/**
 * a[1]
 */
export class AtIndexNode extends BaseNode {
  toString(): string {
    return `${this.left.toString()}[${this.index.toString()}]`;
  }
  id(): NT {
    return NT.AT_INDEX;
  }

  constructor(public left: BaseNode, public index: BaseNode) {
    super();
  }
}

/**
 * a.name
 * a?.name
 */
export class AtKeyNode extends BaseNode {
  toString(): string {
    return `${this.left.toString()}.${this.key.value}`;
  }
  id(): NT {
    return NT.AT_KEY;
  }

  constructor(public left: BaseNode, public op: Token, public key: Token) {
    super();
  }
}
