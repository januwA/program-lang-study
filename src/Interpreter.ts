import { Context } from "./Context";
import {
  BaseNode,
  BinaryNode,
  BinNode,
  BoolNode,
  DecNode,
  FloatNode,
  HexNode,
  NT,
  OctNode,
  UnaryNode,
  VarAccessNode,
  VarAssignNode,
  VarDefineNode,
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

  // cmp
  abstract lt(other: BaseValue): BoolValue;
  abstract gt(other: BaseValue): BoolValue;
  abstract lte(other: BaseValue): BoolValue;
  abstract gte(other: BaseValue): BoolValue;
  abstract ee(other: BaseValue): BoolValue;
  abstract ne(other: BaseValue): BoolValue;
}

export class NumberValue extends BaseValue {
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
        return new IntValue(parseInt((node as DecNode).token.value, 10));
      case NT.HEX:
        return new IntValue(parseInt((node as HexNode).token.value, 16));
      case NT.OCT:
        return new IntValue(parseInt((node as OctNode).token.value, 8));
      case NT.BIN:
        return new IntValue(
          parseInt((node as BinNode).token.value.replace(/_/g, ""), 2)
        );
      case NT.FLOAT:
        return new FloatValue(parseFloat((node as FloatNode).token.value));
      case NT.NULL:
        return new NullValue();
      case NT.BINARY: {
        const _node = node as BinaryNode;
        const left = this.visit(_node.left, context);
        const right = this.visit(_node.right, context);
        switch (_node.token.type) {
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
          default:
            break;
        }
      }
      case NT.UNARY: {
        const _node = node as UnaryNode;
        switch (_node.token.type) {
          case TT.MINUS:
            return this.visit(_node.node, context).mul(new NumberValue(-1));
          case TT.PLUS:
            return this.visit(_node.node, context);
          case TT.NOT:
            return this.visit(_node.node, context).not();
          case TT.BNOT:
            return this.visit(_node.node, context).bnot();
          default:
            throw `Runtime Error: Unexpected token '${_node.token.type}'`;
        }
      }
      case NT.BOOL:
        return new BoolValue((node as BoolNode).token.value === "true");
      case NT.VarDefine: {
        // 定义变量
        const _node = node as VarDefineNode;
        const name = _node.name.value;
        if (context.variables.hasOwnProperty(name)) {
          throw new SyntaxError(
            `Identifier '${name}' has already been declared`,
            _node.posStart,
            node.posEnd
          ).toString();
        } else {
          const value: BaseValue = this.visit(_node.value, context);
          context.variables[name] = value;
          return value;
        }
      }
      case NT.VarAssign: {
        // 赋值变量
        const _node = node as VarAssignNode;
        const name = _node.name.value;
        if (context.variables.hasOwnProperty(name)) {
          const value: BaseValue = this.visit(_node.value, context);
          context.variables[name] = value;
          return value;
        } else {
          throw new ReferenceError(
            `${name} is not defined`,
            _node.posStart,
            node.posEnd
          ).toString();
        }
      }
      case NT.VarAccess: {
        // 使用变量
        const _node = node as VarAccessNode;
        const name = _node.name.value;
        if (context.variables.hasOwnProperty(name)) {
          return context.variables[_node.name.value];
        } else {
          throw new ReferenceError(
            `${name} is not defined`,
            _node.posStart,
            node.posEnd
          ).toString();
        }
      }
      default:
        throw `Runtime Error: Unrecognized node ${node}`;
    }
  }
}
