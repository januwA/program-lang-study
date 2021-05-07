import { Context, VariableSymbol } from "./Context";
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
  LabelNode,
  NT,
  OctNode,
  StringNode,
  UnaryNode,
  VarAccessNode,
  VarAssignNode,
  VarDeclareNode,
  WhileNode,
} from "./Parser";
import { TT, TYPES } from "./Token";
import { ReferenceError, SyntaxError } from "./BaseError";

export abstract class BaseValue {
  abstract toString(): string;

  abstract typeof(): string;

  abstract not(): BoolValue;
  abstract bnot(): IntValue;

  abstract pow(other: BaseValue): BaseValue;
  abstract add(other: BaseValue): BaseValue;
  abstract sub(other: BaseValue): BaseValue;
  abstract mul(other: BaseValue): BaseValue;
  abstract div(other: BaseValue): BaseValue;
  abstract remainder(other: BaseValue): BaseValue;

  abstract band(other: BaseValue): BaseValue;
  abstract bor(other: BaseValue): BaseValue;
  abstract xor(other: BaseValue): BaseValue;
  abstract shl(other: BaseValue): BaseValue;
  abstract shr(other: BaseValue): BaseValue;

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

  // is bool
  abstract isTren(): boolean;
}

export class IntValue extends BaseValue {
  typeof(): string {
    return TYPES.int;
  }
  isTren(): boolean {
    return false;
  }
  nullishCoalescing(other: BaseValue): BaseValue {
    return this;
  }
  pow(other: BaseValue): BaseValue {
    if (other instanceof IntValue) {
      return new IntValue(this.value ** other.value);
    } else if (other instanceof FloatValue) {
      return new FloatValue(this.value ** other.value);
    }
    throw new Error("IntValue pow.");
  }
  remainder(other: BaseValue): BaseValue {
    if (other instanceof IntValue) {
      return new IntValue(this.value % other.value);
    } else if (other instanceof FloatValue) {
      return new FloatValue(this.value % other.value);
    }
    throw new Error("IntValue remainder.");
  }
  xor(other: BaseValue): BaseValue {
    if (other instanceof IntValue) {
      return new IntValue(this.value ^ other.value);
    } else if (other instanceof FloatValue) {
      return new FloatValue(this.value ^ other.value);
    }
    throw new Error("IntValue xor.");
  }
  bnot(): IntValue {
    return new IntValue(~this.value);
  }
  shl(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new IntValue(this.value << other.value);
    }
    throw new Error("IntValue shl.");
  }
  shr(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new IntValue(this.value >> other.value);
    }
    throw new Error("IntValue shr.");
  }
  lt(other: BaseValue): BoolValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new BoolValue(this.value < other.value);
    }
    throw new Error("IntValue lt.");
  }
  gt(other: BaseValue): BoolValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new BoolValue(this.value > other.value);
    }
    throw new Error("IntValue gt.");
  }
  lte(other: BaseValue): BoolValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new BoolValue(this.value <= other.value);
    }
    throw new Error("IntValue lte.");
  }
  gte(other: BaseValue): BoolValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new BoolValue(this.value >= other.value);
    }
    throw new Error("IntValue gte.");
  }
  ee(other: BaseValue): BoolValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new BoolValue(this.value === other.value);
    }
    throw new Error("IntValue ee.");
  }
  ne(other: BaseValue): BoolValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new BoolValue(this.value !== other.value);
    }
    throw new Error("IntValue ne.");
  }
  and(other: BaseValue): BaseValue {
    if (this.value) return other;
    else return this;
  }
  or(other: BaseValue): BaseValue {
    if (this.value) return this;
    else return other;
  }
  band(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new IntValue(this.value & other.value);
    }
    throw new Error("BaseValue band.");
  }
  bor(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new IntValue(this.value | other.value);
    }
    throw new Error("BaseValue bor.");
  }
  not(): BoolValue {
    return new BoolValue(!this.value);
  }
  add(other: BaseValue): BaseValue {
    if (other instanceof IntValue) {
      return new IntValue(this.value + other.value);
    } else if (other instanceof FloatValue) {
      return new FloatValue(this.value + other.value);
    }

    throw new Error("IntValue add.");
  }
  sub(other: BaseValue): BaseValue {
    if (other instanceof IntValue) {
      return new IntValue(this.value - other.value);
    } else if (other instanceof FloatValue) {
      return new FloatValue(this.value - other.value);
    }

    throw new Error("IntValue sub.");
  }
  mul(other: BaseValue): BaseValue {
    if (other instanceof IntValue) {
      return new IntValue(this.value * other.value);
    } else if (other instanceof FloatValue) {
      return new FloatValue(this.value * other.value);
    }

    throw new Error("IntValue mul.");
  }
  div(other: BaseValue): BaseValue {
    if (other instanceof IntValue) {
      return new IntValue(this.value / other.value);
    } else if (other instanceof FloatValue) {
      return new FloatValue(this.value / other.value);
    }

    throw new Error("BaseValue div.");
  }
  toString(): string {
    return this.value.toString();
  }
  constructor(public value: number) {
    super();
  }
}

export class FloatValue extends BaseValue {
  typeof(): string {
    return TYPES.float;
  }
  isTren(): boolean {
    return false;
  }
  nullishCoalescing(other: BaseValue): BaseValue {
    return this;
  }
  pow(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new FloatValue(this.value ** other.value);
    }
    throw new Error("BaseValue pow.");
  }
  remainder(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new IntValue(this.value % other.value);
    }
    throw new Error("BaseValue remainder.");
  }
  xor(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new IntValue(this.value ^ other.value);
    }
    throw new Error("BaseValue xor.");
  }
  bnot(): IntValue {
    return new IntValue(~this.value);
  }
  shl(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new IntValue(this.value << other.value);
    }
    throw new Error("BaseValue shl.");
  }
  shr(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new IntValue(this.value >> other.value);
    }
    throw new Error("BaseValue shr.");
  }
  lt(other: BaseValue): BoolValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new BoolValue(this.value < other.value);
    }
    throw new Error("BaseValue lt.");
  }
  gt(other: BaseValue): BoolValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new BoolValue(this.value > other.value);
    }
    throw new Error("BaseValue gt.");
  }
  lte(other: BaseValue): BoolValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new BoolValue(this.value <= other.value);
    }
    throw new Error("BaseValue lte.");
  }
  gte(other: BaseValue): BoolValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new BoolValue(this.value >= other.value);
    }
    throw new Error("BaseValue gte.");
  }
  ee(other: BaseValue): BoolValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new BoolValue(this.value === other.value);
    }
    throw new Error("BaseValue ee.");
  }
  ne(other: BaseValue): BoolValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new BoolValue(this.value !== other.value);
    }
    throw new Error("BaseValue ne.");
  }
  and(other: BaseValue): BaseValue {
    if (this.value) return other;
    else return this;
  }
  or(other: BaseValue): BaseValue {
    if (this.value) return this;
    else return other;
  }
  band(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new IntValue(this.value & other.value);
    }
    throw new Error("BaseValue band.");
  }
  bor(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new IntValue(this.value | other.value);
    }
    throw new Error("BaseValue bor.");
  }
  not(): BoolValue {
    return new BoolValue(!this.value);
  }
  add(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new FloatValue(this.value + other.value);
    }

    throw new Error("BaseValue add.");
  }
  sub(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new FloatValue(this.value - other.value);
    }

    throw new Error("BaseValue sub.");
  }
  mul(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new FloatValue(this.value * other.value);
    }

    throw new Error("BaseValue mul.");
  }
  div(other: BaseValue): BaseValue {
    if (other instanceof IntValue || other instanceof FloatValue) {
      return new FloatValue(this.value / other.value);
    }

    throw new Error("BaseValue div.");
  }
  toString(): string {
    return this.value.toString();
  }
  constructor(public value: number) {
    super();
  }
}

export class BoolValue extends BaseValue {
  isTren(): boolean {
    return this.value;
  }
  nullishCoalescing(other: BaseValue): BaseValue {
    return this;
  }
  typeof(): string {
    return TYPES.bool;
  }
  pow(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  remainder(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  xor(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  bnot(): IntValue {
    throw new Error("Method not implemented.");
  }
  shl(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  shr(other: BaseValue): BaseValue {
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
  band(other: BaseValue): BaseValue {
    throw new Error("BoolValue band.");
  }
  bor(other: BaseValue): BaseValue {
    throw new Error("BoolValue bor.");
  }
  not(): BoolValue {
    return new BoolValue(!this.value);
  }
  toString(): string {
    return this.value ? "true" : "false";
  }
  add(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  sub(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  mul(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  div(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  constructor(public value: boolean) {
    super();
  }
}

export class NullValue extends BaseValue {
  isTren(): boolean {
    return false;
  }
  nullishCoalescing(other: BaseValue): BaseValue {
    return other;
  }

  typeof(): string {
    return TYPES.Null;
  }

  toString(): string {
    return "null";
  }
  not(): BoolValue {
    return new BoolValue(true);
  }
  bnot(): IntValue {
    throw new Error("Method not implemented.");
  }
  pow(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  add(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  sub(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  mul(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  div(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  remainder(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  band(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  bor(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  xor(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  shl(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  shr(other: BaseValue): BaseValue {
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

export class StringValue extends BaseValue {
  toString(): string {
    return `"${this.value}"`;
  }
  typeof(): string {
    return TYPES.string;
  }
  not(): BoolValue {
    return new BoolValue(!this.value);
  }
  bnot(): IntValue {
    throw new Error("Method not implemented.");
  }
  pow(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  add(other: BaseValue): BaseValue {
    if (other instanceof StringValue) {
      return new StringValue(this.value + other.value);
    }

    throw new Error("Method not implemented.");
  }
  sub(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  mul(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  div(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  remainder(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  band(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  bor(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  xor(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  shl(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  shr(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  and(other: BaseValue): BaseValue {
    if (this.value) return other;
    else return this;
  }
  or(other: BaseValue): BaseValue {
    if (this.value) return this;
    else return other;
  }
  nullishCoalescing(other: BaseValue): BaseValue {
    return this;
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
    if (other instanceof StringValue) {
      return new BoolValue(this.value === other.value);
    }

    return new BoolValue(false);
  }
  ne(other: BaseValue): BoolValue {
    if (other instanceof StringValue) {
      return new BoolValue(this.value !== other.value);
    }

    return new BoolValue(true);
  }
  isTren(): boolean {
    return false;
  }

  constructor(public value: string) {
    super();
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
      case NT.STRING:
        return this.visitString(node as StringNode);
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
  visitString(node: StringNode): BaseValue {
    return new StringValue(node.token.value);
  }

  visitFor(node: ForNode, context: Context): BaseValue {
    const newContext = new Context(context);
    let result: BaseValue = new NullValue();
    this.visit(node.init, newContext);
    while (true) {
      const condition: BaseValue = this.visit(node.condition, newContext);
      if (!condition.isTren()) break;
      result = this.visit(node.bodyNode, newContext);
      this.visit(node.stepNode, newContext);
    }
    return result;
  }

  visitWhile(node: WhileNode, context: Context): BaseValue {
    let result: BaseValue = new NullValue();
    while (true) {
      const condition: BaseValue = this.visit(node.condition, context);
      if (!condition.isTren()) break;
      result = this.visit(node.bodyNode, context);
    }
    return result;
  }

  visitIf(node: IfNode, context: Context): BaseValue {
    const condition: BaseValue = this.visit(node.condition, context);
    if (condition.isTren()) {
      return this.visit(node.thenNode, context);
    } else {
      if (node.elseNode) {
        return this.visit(node.elseNode, context);
      } else {
        return new NullValue();
      }
    }
  }

  visitBlock(node: BlockNode, context: Context): BaseValue {
    let result: BaseValue = new NullValue();
    const newContext = new Context(context);
    for (const statement of node.statements) {
      if (statement instanceof LabelNode) {
        context.labels.set(statement.label.name, statement.label);
        continue;
      }
      result = this.visit(statement, newContext);
    }
    return result;
  }

  // 使用变量
  private visitVarAccess(node: VarAccessNode, context: Context): BaseValue {
    const name = node.name.value;
    if (context.hasVariable(name)) {
      return context.getVariable(name).value;
    } else {
      throw `${name} is not defined`;
    }
  }

  // 赋值变量
  private visitVarAssign(node: VarAssignNode, context: Context): BaseValue {
    const name = node.name.value;
    if (context.hasVariable(name)) {
      const data = context.getVariable(name);
      if (data.isConst) {
        throw `Assignment to constant variable.`;
      }
      let value: BaseValue = this.visit(node.value, context);

      if (node.operator.is(TT.PLUS_EQ)) {
        value = data.value.add(value);
      } else if (node.operator.is(TT.MINUS_EQ)) {
        value = data.value.sub(value);
      } else if (node.operator.is(TT.MUL_EQ)) {
        value = data.value.mul(value);
      } else if (node.operator.is(TT.DIV_EQ)) {
        value = data.value.mul(value);
      } else if (node.operator.is(TT.POW_EQ)) {
        value = data.value.pow(value);
      } else if (node.operator.is(TT.REMAINDER_EQ)) {
        value = data.value.remainder(value);
      } else if (node.operator.is(TT.SHL_EQ)) {
        value = data.value.shl(value);
      } else if (node.operator.is(TT.SHR_EQ)) {
        value = data.value.shr(value);
      } else if (node.operator.is(TT.BAND_EQ)) {
        value = data.value.band(value);
      } else if (node.operator.is(TT.XOR_EQ)) {
        value = data.value.xor(value);
      } else if (node.operator.is(TT.BOR_EQ)) {
        value = data.value.bor(value);
      } else if (node.operator.is(TT.AND_EQ)) {
        value = data.value.and(value);
      } else if (node.operator.is(TT.OR_EQ)) {
        value = data.value.or(value);
      } else if (node.operator.is(TT.NULLISH_EQ)) {
        value = data.value.nullishCoalescing(value);
      }
      data.value = value;

      if (data.type !== TYPES.auto) {
        const valueType: string = value.typeof();
        if (valueType !== data.type && valueType !== TYPES.Null) {
          throw `The ${valueType} type cannot be assigned to the ${data.type} type`;
        }
      }

      return value;
    } else {
      throw `${name} is not defined`;
    }
  }

  // 定义变量
  private visitVarDeclare(node: VarDeclareNode, context: Context): BaseValue {
    const name = node.name.value;
    if (context.canDeclareVariable(name)) {
      const value: BaseValue = this.visit(node.value, context);

      // check type
      if (!node.type.isKeyword(TYPES.auto)) {
        const valueType: string = value.typeof();
        if (valueType !== node.type.value && valueType !== TYPES.Null) {
          throw `The ${valueType} type cannot be assigned to the ${node.type.value} type`;
        }
      }

      context.declareVariable(
        name,
        new VariableSymbol(node.isConst, node.type.value, name, value)
      );
      return value;
    } else {
      // 当前作用域内，不能再次定义
      throw `Identifier '${name}' has already been declared`;
    }
  }

  private visitBool(node: BoolNode): BaseValue {
    return new BoolValue(node.token.value === "true");
  }

  private visitUnary(node: UnaryNode, context: Context) {
    switch (node.token.type) {
      case TT.MINUS:
        return this.visit(node.node, context).mul(new IntValue(-1));
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
    return new FloatValue(node.value);
  }

  private visitBin(node: BinNode): BaseValue {
    return new IntValue(node.value);
  }

  private visitOct(node: OctNode): BaseValue {
    return new IntValue(node.value);
  }

  private visitHex(node: HexNode): BaseValue {
    return new IntValue(node.value);
  }

  private visitDec(node: DecNode): BaseValue {
    return new IntValue(node.value);
  }
}
