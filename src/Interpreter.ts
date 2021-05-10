import { Context, VariableSymbol } from "./Context";
import {
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
  HexNode,
  IfNode,
  MemberNode,
  NT,
  OctNode,
  RetNode,
  StringNode,
  UnaryNode,
  VarAccessNode,
  VarAssignNode,
  VarDeclareNode,
  WhileNode,
} from "./BaseNode";
import { BaseNode } from "./BaseNode";
import { TT } from "./Token";
import {
  BaseFunctionValue,
  BaseValue,
  BoolValue,
  FloatValue,
  FunctionValue,
  IntValue,
  NullValue,
  StringValue,
} from "./BaseValue";
import { BaseTypes } from "./BaseTypes";

/**
 * 解析语法树
 */
export class Interpreter {
  // fun
  private hasCall = false;
  private inCall() {
    const canOut = this.hasCall === false;
    this.hasCall = true;

    return () => {
      if (canOut) this.hasCall = false;
    };
  }

  isRet = false;

  // for, while
  private hasControlFlow = false;
  private inControlFlow() {
    const canOut = this.hasControlFlow === false;
    this.hasControlFlow = true;

    return () => {
      if (canOut) this.hasControlFlow = false;
    };
  }
  isContinue = false;
  isBreak = false;

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
      case NT.MEMBER:
        return this.visitMember(node as MemberNode, context);
      case NT.IF:
        return this.visitIf(node as IfNode, context);
      case NT.WHILE:
        return this.visitWhile(node as WhileNode, context);
      case NT.FOR:
        return this.visitFor(node as ForNode, context);
      case NT.CALL:
        return this.visitCall(node as CallNode, context);
      case NT.FUN:
        return this.visitFun(node as FunNode, context);
      case NT.RET:
        return this.visitRet(node as RetNode, context);
      case NT.CONTINUE: {
        if (!this.hasControlFlow) {
          throw `Illegal continue statement`;
        }
        this.isContinue = true;
        return new NullValue();
      }
      case NT.BREAK:
        if (!this.hasControlFlow) {
          throw `Illegal break statement`;
        }
        this.isBreak = true;
        return new NullValue();
      default:
        throw `Runtime Error: Unrecognized node ${node}`;
    }
  }

  visitRet(node: RetNode, context: Context): BaseValue {
    if (this.hasCall) {
      this.isRet = true;
    } else {
      throw `Illegal return statement`;
    }
    return node.value ? this.visit(node.value, context) : new NullValue();
  }

  visitMember(node: MemberNode, context: Context): BaseValue {
    let result: BaseValue = new NullValue();
    for (const statement of node.statements) {
      result = this.visit(statement, context);
    }
    return result;
  }

  visitFun(node: FunNode, context: Context): BaseValue {
    const value = new FunctionValue(
      node.returnType,
      node.name.value,
      node.params,
      node.body,
      context
    );
    context.declareVariable(
      node.name.value,
      new VariableSymbol(true, "fun", value)
    );
    return new NullValue();
  }

  visitCall(node: CallNode, context: Context): BaseValue {
    const outCall = this.inCall();

    const funValue: BaseValue = this.visit(node.name, context);
    if (funValue instanceof BaseFunctionValue) {
      const value = funValue.call(
        node.args.map((arg) => this.visit(arg, context)), // 值传递
        this
      );
      outCall();
      return value;
    } else {
      throw `${funValue.toString()} is not a function`;
    }
  }

  visitString(node: StringNode): BaseValue {
    return new StringValue(node.token.value);
  }

  visitFor(node: ForNode, context: Context): BaseValue {
    const outControlFlow = this.inControlFlow();
    const newContext = new Context(context);
    let result: BaseValue = new NullValue();
    this.visit(node.init, newContext);
    while (true) {
      const condition: BaseValue = this.visit(node.condition, newContext);
      if (!condition.isTren()) break;

      result = this.visit(node.bodyNode, newContext);
      if (this.isContinue) {
        this.isContinue = false;
        this.visit(node.stepNode, newContext);
        continue;
      }

      if (this.isBreak) {
        this.isBreak = false;
        break;
      }

      this.visit(node.stepNode, newContext);
    }

    outControlFlow();
    return result;
  }

  visitWhile(node: WhileNode, context: Context): BaseValue {
    const outControlFlow = this.inControlFlow();
    let result: BaseValue = new NullValue();
    while (true) {
      const condition: BaseValue = this.visit(node.condition, context);
      if (!condition.isTren()) break;
      result = this.visit(node.bodyNode, context);
      if (this.isContinue) {
        this.isContinue = false;
        continue;
      }

      if (this.isBreak) {
        this.isBreak = false;
        break;
      }
    }
    outControlFlow();
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
    if (node.type === BlockType.fun) {
      for (const statement of node.statements) {
        const value = this.visit(statement, context);
        if (this.isRet) {
          this.isRet = false;
          return value;
        }
      }

      return new NullValue();
    } else {
      let result: BaseValue = new NullValue();
      const newContext = new Context(context);
      for (const statement of node.statements) {
        result = this.visit(statement, newContext);

        if (this.isContinue) {
          if (this.hasControlFlow) break;
          else continue;
        }
        if (this.isBreak) break;
      }
      return result;
    }
  }

  // 使用变量
  visitVarAccess(node: VarAccessNode, context: Context): BaseValue {
    const name = node.name.value;
    if (context.hasVariable(name)) {
      return context.getVariable(name).value;
    } else {
      throw `${name} is not defined`;
    }
  }

  // 赋值变量
  visitVarAssign(node: VarAssignNode, context: Context): BaseValue {
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

      if (data.type !== BaseTypes.auto) {
        const valueType: string = value.typeof();
        if (valueType !== data.type && valueType !== BaseTypes.Null) {
          throw `The ${valueType} type cannot be assigned to the ${data.type} type`;
        }
      }
      return (data.value = value);
    } else {
      throw `${name} is not defined`;
    }
  }

  // 定义变量
  visitVarDeclare(node: VarDeclareNode, context: Context): BaseValue {
    const name: string = node.name.value;
    const type: string = node.type.value;
    if (context.canDeclareVariable(name)) {
      const value: BaseValue = this.visit(node.value, context);

      // check type
      if (type !== BaseTypes.auto) {
        const valueType: string = value.typeof();
        if (valueType !== type && valueType !== BaseTypes.Null) {
          throw `The ${valueType} type cannot be assigned to the ${node.type.value} type`;
        }
      }

      context.declareVariable(
        name,
        new VariableSymbol(node.isConst, node.type.value, value)
      );
      return new NullValue();
    } else {
      // 当前作用域内，不能再次定义
      throw `Identifier '${name}' has already been declared`;
    }
  }

  visitBool(node: BoolNode): BaseValue {
    return new BoolValue(node.token.value === "true");
  }

  visitUnary(node: UnaryNode, context: Context) {
    switch (node.token.type) {
      case TT.MINUS:
        return this.visit(node.node, context).mul(new IntValue(-1));
      case TT.PLUS:
        return this.visit(node.node, context);
      case TT.NOT:
        return this.visit(node.node, context).not();
      case TT.BNOT:
        return this.visit(node.node, context).bnot();
      case TT.IDENTIFIER: {
        switch (node.token.value) {
          case BaseTypes.int:
            return this.visit(node.node, context).toInt();
          case BaseTypes.float:
            return this.visit(node.node, context).toFloat();
          case BaseTypes.string:
            return this.visit(node.node, context).toStr();
          case BaseTypes.bool:
            return this.visit(node.node, context).toBool();
          default:
            throw `Type conversion failed ${node.token.value}`;
        }
      }
      default:
        throw `Runtime Error: Unexpected token '${node.token.type}'`;
    }
  }

  visitBinary(node: BinaryNode, context: Context) {
    const left = this.visit(node.left, context);
    const right = this.visit(node.right, context);
    switch (node.operator.type) {
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

  visitNull(): BaseValue {
    return new NullValue();
  }

  visitFloat(node: FloatNode): BaseValue {
    return new FloatValue(node.value);
  }

  visitBin(node: BinNode): BaseValue {
    return new IntValue(node.value);
  }

  visitOct(node: OctNode): BaseValue {
    return new IntValue(node.value);
  }

  visitHex(node: HexNode): BaseValue {
    return new IntValue(node.value);
  }

  visitDec(node: DecNode): BaseValue {
    return new IntValue(node.value);
  }
}
