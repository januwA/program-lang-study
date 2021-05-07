import { Context, VariableSymbol } from "./Context";
import {
  BinaryNode,
  BinNode,
  BlockNode,
  BoolNode,
  CallNode,
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
} from "./BaseNode";
import { BaseNode } from "./BaseNode";
import { TT, TYPES } from "./Token";
import {
  BaseFunctionValue,
  BaseValue,
  BoolValue,
  FloatValue,
  IntValue,
  NullValue,
  StringValue,
} from "./BaseValue";

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
      case NT.CALL:
        return this.visitCall(node as CallNode, context);
      default:
        throw `Runtime Error: Unrecognized node ${node}`;
    }
  }

  visitCall(node: CallNode, context: Context): BaseValue {
    const funValue: BaseValue = this.visit(node.name, context);
    if (funValue instanceof BaseFunctionValue) {
      return funValue.call(
        node.args.map((arg) => this.visit(arg, context)),
        context
      );
    } else {
      throw `${funValue.toString()} is not a function`;
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
        new VariableSymbol(node.isConst, node.type.value, value)
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
      case TT.KEYWORD: {
        switch (node.token.value) {
          case TYPES.int:
            return this.visit(node.node, context).toInt();
          case TYPES.float:
            return this.visit(node.node, context).toFloat();
          case TYPES.string:
            return this.visit(node.node, context).toStr();
          case TYPES.bool:
            return this.visit(node.node, context).toBool();
          default:
            break;
        }
      }
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
