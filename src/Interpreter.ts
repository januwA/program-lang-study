import { Context } from "./Context";
import {
  BaseNode,
  BinaryNode,
  BinNode,
  BlockNode,
  BoolNode,
  DecNode,
  FloatNode,
  ForNode,
  HexNode,
  IfNode,
  NT,
  OctNode,
  UnaryNode,
  VarAccessNode,
  VarAssignNode,
  VarDeclareNode,
  WhileNode,
} from "./Parser";
import { TT } from "./Token";
import { ReferenceError, SyntaxError } from "./BaseError";

export abstract class BaseValue {
  abstract toString(): string;

  abstract typeof(): string;

  abstract not(): BoolValue;
  abstract bnot(): NumberValue;

  abstract pow(other: BaseValue): NumberValue;
  abstract add(other: BaseValue): NumberValue;
  abstract sub(other: BaseValue): NumberValue;
  abstract mul(other: BaseValue): NumberValue;
  abstract div(other: BaseValue): NumberValue;
  abstract remainder(other: BaseValue): NumberValue;

  abstract band(other: BaseValue): NumberValue;
  abstract bor(other: BaseValue): NumberValue;
  abstract xor(other: BaseValue): NumberValue;
  abstract shl(other: BaseValue): NumberValue;
  abstract shr(other: BaseValue): NumberValue;

  abstract and(other: BaseValue): BaseValue;
  abstract or(other: BaseValue): BaseValue;

  abstract nullishCoalescing(other: BaseValue): BaseValue;

  // cmp
  abstract lt(other: BaseValue): BoolValue;
  abstract gt(other: BaseValue): BoolValue;
  abstract lte(other: BaseValue): BoolValue;
  abstract gte(other: BaseValue): BoolValue;
  abstract ee(other: BaseValue): BoolValue;
  abstract ne(other: BaseValue): BoolValue;
}

export class NumberValue extends BaseValue {
  nullishCoalescing(other: BaseValue): BaseValue {
    return this;
  }
  typeof(): string {
    return "number";
  }
  pow(other: BaseValue): NumberValue {
    if (other instanceof NumberValue) {
      return new NumberValue(this.value ** other.value);
    }
    throw new Error("NumberValue pow.");
  }
  remainder(other: BaseValue): NumberValue {
    if (other instanceof NumberValue) {
      return new NumberValue(this.value % other.value);
    }
    throw new Error("NumberValue remainder.");
  }
  xor(other: BaseValue): NumberValue {
    if (other instanceof NumberValue) {
      return new NumberValue(this.value ^ other.value);
    }
    throw new Error("NumberValue xor.");
  }
  bnot(): NumberValue {
    return new NumberValue(~this.value);
  }
  shl(other: BaseValue): NumberValue {
    if (other instanceof NumberValue) {
      return new NumberValue(this.value << other.value);
    }
    throw new Error("NumberValue shl.");
  }
  shr(other: BaseValue): NumberValue {
    if (other instanceof NumberValue) {
      return new NumberValue(this.value >> other.value);
    }
    throw new Error("NumberValue shr.");
  }
  lt(other: BaseValue): BoolValue {
    if (other instanceof NumberValue) {
      return new BoolValue(this.value < other.value);
    }
    throw new Error("NumberValue lt.");
  }
  gt(other: BaseValue): BoolValue {
    if (other instanceof NumberValue) {
      return new BoolValue(this.value > other.value);
    }
    throw new Error("NumberValue gt.");
  }
  lte(other: BaseValue): BoolValue {
    if (other instanceof NumberValue) {
      return new BoolValue(this.value <= other.value);
    }
    throw new Error("NumberValue lte.");
  }
  gte(other: BaseValue): BoolValue {
    if (other instanceof NumberValue) {
      return new BoolValue(this.value >= other.value);
    }
    throw new Error("NumberValue gte.");
  }
  ee(other: BaseValue): BoolValue {
    if (other instanceof NumberValue) {
      return new BoolValue(this.value === other.value);
    }
    throw new Error("NumberValue ee.");
  }
  ne(other: BaseValue): BoolValue {
    if (other instanceof NumberValue) {
      return new BoolValue(this.value !== other.value);
    }
    throw new Error("NumberValue ne.");
  }
  and(other: BaseValue): BaseValue {
    if (this.value) return other;
    else return this;
  }
  or(other: BaseValue): BaseValue {
    if (this.value) return this;
    else return other;
  }
  band(other: BaseValue): NumberValue {
    if (other instanceof NumberValue) {
      return new NumberValue(this.value & other.value);
    }
    throw new Error("NumberValue band.");
  }
  bor(other: BaseValue): NumberValue {
    if (other instanceof NumberValue) {
      return new NumberValue(this.value | other.value);
    }
    throw new Error("NumberValue bor.");
  }
  not(): BoolValue {
    return new BoolValue(!this.value);
  }
  add(other: BaseValue): NumberValue {
    if (other instanceof NumberValue) {
      return new NumberValue(this.value + other.value);
    }

    throw new Error("NumberValue add.");
  }
  sub(other: BaseValue): NumberValue {
    if (other instanceof NumberValue) {
      return new NumberValue(this.value - other.value);
    }

    throw new Error("NumberValue sub.");
  }
  mul(other: BaseValue): NumberValue {
    if (other instanceof NumberValue) {
      return new NumberValue(this.value * other.value);
    }

    throw new Error("NumberValue mul.");
  }
  div(other: BaseValue): NumberValue {
    if (other instanceof NumberValue) {
      return new NumberValue(this.value / other.value);
    }

    throw new Error("NumberValue div.");
  }
  toString(): string {
    return this.value.toString();
  }
  constructor(public value: number) {
    super();
  }
}

export class IntValue extends NumberValue {
  typeof(): string {
    return "int";
  }
}

export class FloatValue extends NumberValue {
  typeof(): string {
    return "float";
  }
}

export class BoolValue extends BaseValue {
  nullishCoalescing(other: BaseValue): BaseValue {
    return this;
  }
  typeof(): string {
    return "bool";
  }
  pow(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  remainder(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  xor(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  bnot(): NumberValue {
    throw new Error("Method not implemented.");
  }
  shl(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  shr(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  lt(other: BaseValue): BoolValue {
    throw new Error("Method not implemented.");
  }
  gt(other: BaseValue): BoolValue {
    throw new Error("Method not implemented.");
  }
  lte(other: BaseValue): BoolValue {
    throw new Error("Method not implemented.");
  }
  gte(other: BaseValue): BoolValue {
    throw new Error("Method not implemented.");
  }
  ee(other: BaseValue): BoolValue {
    if (other instanceof BoolValue) {
      return new BoolValue(this.value === other.value);
    }
    throw new Error("BoolValue ee.");
  }
  ne(other: BaseValue): BoolValue {
    if (other instanceof BoolValue) {
      return new BoolValue(this.value !== other.value);
    }
    throw new Error("BoolValue ne.");
  }
  and(other: BaseValue): BaseValue {
    if (this.value) return other;
    else return this;
  }
  or(other: BaseValue): BaseValue {
    if (this.value) return this;
    else return other;
  }
  band(other: BaseValue): NumberValue {
    throw new Error("BoolValue band.");
  }
  bor(other: BaseValue): NumberValue {
    throw new Error("BoolValue bor.");
  }
  not(): BoolValue {
    return new BoolValue(!this.value);
  }
  toString(): string {
    return this.value ? "true" : "false";
  }
  add(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  sub(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  mul(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  div(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  constructor(public value: boolean) {
    super();
  }
}

export class NullValue extends BaseValue {
  nullishCoalescing(other: BaseValue): BaseValue {
    return other;
  }

  typeof(): string {
    return "null";
  }

  toString(): string {
    return "null";
  }
  not(): BoolValue {
    return new BoolValue(true);
  }
  bnot(): NumberValue {
    throw new Error("Method not implemented.");
  }
  pow(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  add(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  sub(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  mul(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  div(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  remainder(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  band(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  bor(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  xor(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  shl(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  shr(other: BaseValue): NumberValue {
    throw new Error("Method not implemented.");
  }
  and(other: BaseValue): BaseValue {
    return this;
  }
  or(other: BaseValue): BaseValue {
    return other;
  }
  lt(other: BaseValue): BoolValue {
    throw new Error("Method not implemented.");
  }
  gt(other: BaseValue): BoolValue {
    throw new Error("Method not implemented.");
  }
  lte(other: BaseValue): BoolValue {
    throw new Error("Method not implemented.");
  }
  gte(other: BaseValue): BoolValue {
    throw new Error("Method not implemented.");
  }
  ee(other: BaseValue): BoolValue {
    if (other instanceof NullValue) {
      return new BoolValue(true);
    }
    return new BoolValue(false);
  }
  ne(other: BaseValue): BoolValue {
    if (other instanceof NullValue) {
      return new BoolValue(false);
    }
    return new BoolValue(true);
  }
}

/**
 * 解析语法树
 */
export class Interpreter {
  constructor() {}

  visit(node: BaseNode, context: Context): BaseValue {
    switch (node.id()) {
      case NT.DEC:
        return this.visitDec(node as DecNode);
      case NT.HEX:
        return this.visitHex(node as HexNode);
      case NT.OCT:
        return this.visitOct(node as OctNode);
      case NT.BIN:
        return this.visitBin(node as BinNode);
      case NT.FLOAT:
        return this.visitFloat(node as FloatNode);

      case NT.NULL:
        return this.visitNull();

      case NT.BOOL:
        return this.visitBool(node as BoolNode);

      case NT.BINARY:
        return this.visitBinary(node as BinaryNode, context);
      case NT.UNARY:
        return this.visitUnary(node as UnaryNode, context);
      case NT.VarDeclare:
        return this.visitVarDeclare(node as VarDeclareNode, context);
      case NT.VarAssign:
        return this.visitVarAssign(node as VarAssignNode, context);
      case NT.VarAccess:
        return this.visitVarAccess(node as VarAccessNode, context);
      case NT.BLOCK:
        return this.visitBlock(node as BlockNode, context);
      case NT.IF:
        return this.visitIf(node as IfNode, context);
      case NT.WHILE:
        return this.visitWhile(node as WhileNode, context);
      case NT.FOR:
        return this.visitFor(node as ForNode, context);
      default:
        throw `Runtime Error: Unrecognized node ${node}`;
    }
  }

  visitFor(node: ForNode, context: Context): BaseValue {
    const newContext = new Context(context);
    let result = new NullValue();
    this.visit(node.init, newContext);
    while (true) {
      const condition: BaseValue = this.visit(node.condition, newContext);
      if (condition instanceof BoolValue) {
        if (condition.value === false) break;
        result = this.visit(node.bodyNode, newContext);
        this.visit(node.stepNode, newContext);
      } else {
        throw `Runtime Error: condition is not a bool value`;
      }
    }
    return result;
  }

  visitWhile(node: WhileNode, context: Context): BaseValue {
    let result = new NullValue();
    while (true) {
      const condition: BaseValue = this.visit(node.condition, context);
      if (condition instanceof BoolValue) {
        if (condition.value === false) break;
        result = this.visit(node.bodyNode, context);
      } else {
        throw `Runtime Error: condition is not a bool value`;
      }
    }
    return result;
  }

  visitIf(node: IfNode, context: Context): BaseValue {
    const condition: BaseValue = this.visit(node.condition, context);
    if (condition instanceof BoolValue) {
      if (condition.value === true) {
        return this.visit(node.thenNode, context);
      } else {
        if (node.elseNode) {
          return this.visit(node.elseNode, context);
        } else {
          return new NullValue();
        }
      }
    } else {
      throw `Runtime Error: condition is not a bool value`;
    }
  }

  visitBlock(node: BlockNode, context: Context): BaseValue {
    let result: BaseValue = new NullValue();
    const newContext = new Context(context);
    for (const statement of node.statements) {
      result = this.visit(statement, newContext);
    }
    return result;
  }

  // 使用变量
  private visitVarAccess(node: VarAccessNode, context: Context): BaseValue {
    const name = node.name.value;
    if (context.hasVariable(name)) {
      return context.getVariable(name);
    } else {
      throw new ReferenceError(
        `${name} is not defined`,
        node.posStart,
        node.posEnd
      ).toString();
    }
  }

  // 赋值变量
  private visitVarAssign(node: VarAssignNode, context: Context): BaseValue {
    const name = node.name.value;
    if (context.hasVariable(name)) {
      let value: BaseValue = this.visit(node.value, context);

      if (node.operator.is(TT.PLUS_EQ)) {
        value = context.getVariable(name).add(value);
      } else if (node.operator.is(TT.MINUS_EQ)) {
        value = context.getVariable(name).sub(value);
      } else if (node.operator.is(TT.MUL_EQ)) {
        value = context.getVariable(name).mul(value);
      } else if (node.operator.is(TT.DIV_EQ)) {
        value = context.getVariable(name).mul(value);
      } else if (node.operator.is(TT.POW_EQ)) {
        value = context.getVariable(name).pow(value);
      } else if (node.operator.is(TT.REMAINDER_EQ)) {
        value = context.getVariable(name).remainder(value);
      } else if (node.operator.is(TT.SHL_EQ)) {
        value = context.getVariable(name).shl(value);
      } else if (node.operator.is(TT.SHR_EQ)) {
        value = context.getVariable(name).shr(value);
      } else if (node.operator.is(TT.BAND_EQ)) {
        value = context.getVariable(name).band(value);
      } else if (node.operator.is(TT.XOR_EQ)) {
        value = context.getVariable(name).xor(value);
      } else if (node.operator.is(TT.BOR_EQ)) {
        value = context.getVariable(name).bor(value);
      } else if (node.operator.is(TT.AND_EQ)) {
        value = context.getVariable(name).and(value);
      } else if (node.operator.is(TT.OR_EQ)) {
        value = context.getVariable(name).or(value);
      } else if (node.operator.is(TT.NULLISH_EQ)) {
        value = context.getVariable(name).nullishCoalescing(value);
      }

      context.setVariable(name, value);
      return value;
    } else {
      throw new ReferenceError(
        `${name} is not defined`,
        node.posStart,
        node.posEnd
      ).toString();
    }
  }

  // 定义变量
  private visitVarDeclare(node: VarDeclareNode, context: Context): BaseValue {
    const name = node.name.value;
    if (context.canDeclareVariable(name)) {
      const value: BaseValue = this.visit(node.value, context);
      context.declareVariable(name, value);
      return value;
    } else {
      // 当前作用域内，不能再次定义
      throw new SyntaxError(
        `Identifier '${name}' has already been declared`,
        node.posStart,
        node.posEnd
      ).toString();
    }
  }

  private visitBool(node: BoolNode): BaseValue {
    return new BoolValue(node.token.value === "true");
  }

  private visitUnary(node: UnaryNode, context: Context) {
    switch (node.token.type) {
      case TT.MINUS:
        return this.visit(node.node, context).mul(new NumberValue(-1));
      case TT.PLUS:
        return this.visit(node.node, context);
      case TT.NOT:
        return this.visit(node.node, context).not();
      case TT.BNOT:
        return this.visit(node.node, context).bnot();
      default:
        throw `Runtime Error: Unexpected token '${node.token.type}'`;
    }
  }

  private visitBinary(node: BinaryNode, context: Context) {
    const left = this.visit(node.left, context);
    const right = this.visit(node.right, context);
    switch (node.token.type) {
      case TT.PLUS:
        return left.add(right);
      case TT.MINUS:
        return left.sub(right);
      case TT.MUL:
        return left.mul(right);
      case TT.DIV:
        return left.div(right);
      case TT.AND:
        return left.and(right);
      case TT.OR:
        return left.or(right);
      case TT.BAND:
        return left.band(right);
      case TT.BOR:
        return left.bor(right);
      case TT.POW:
        return left.pow(right);
      case TT.REMAINDER:
        return left.remainder(right);
      case TT.XOR:
        return left.xor(right);
      case TT.SHL:
        return left.shl(right);
      case TT.SHR:
        return left.shr(right);
      case TT.LT:
        return left.lt(right);
      case TT.GT:
        return left.gt(right);
      case TT.LTE:
        return left.lte(right);
      case TT.GTE:
        return left.gte(right);
      case TT.EE:
        return left.ee(right);
      case TT.NE:
        return left.ne(right);
      case TT.NULLISH:
        return left.nullishCoalescing(right);
      default:
        break;
    }
  }

  private visitNull(): BaseValue {
    return new NullValue();
  }

  private visitFloat(node: FloatNode): BaseValue {
    return new FloatValue(parseFloat(node.token.value));
  }

  private visitBin(node: BinNode): BaseValue {
    return new IntValue(parseInt(node.token.value.replace(/_/g, ""), 2));
  }

  private visitOct(node: OctNode): BaseValue {
    return new IntValue(parseInt(node.token.value, 8));
  }

  private visitHex(node: HexNode): BaseValue {
    return new IntValue(parseInt(node.token.value, 16));
  }

  private visitDec(node: DecNode): BaseValue {
    return new IntValue(parseInt(node.token.value, 10));
  }
}
