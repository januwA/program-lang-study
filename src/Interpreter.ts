import { Context, ListContext, VariableSymbol } from "./Context";
import {
  AtIndexNode,
  AtKeyNode,
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
  ListNode,
  MapNode,
  MemberNode,
  NT,
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
import { BaseNode } from "./BaseNode";
import { Token, TT } from "./Token";
import {
  BaseFunctionValue,
  BaseValue,
  BoolValue,
  FloatValue,
  FunctionValue,
  IntValue,
  ListValue,
  MapValue,
  NullValue,
  StringValue,
} from "./BaseValue";
import { BaseTypes } from "./BaseTypes";
import { Keyword } from "./Keywords";

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
      case NT.TEXT_SPAN:
        return this.visitTextSpan(node as TextSpanNode, context);
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
      case NT.TERNARY:
        return this.visitTernary(node as TernaryNode, context);
      case NT.LIST:
        return this.visitList(node as ListNode, context);
      case NT.MAP:
        return this.visitMap(node as MapNode, context);
      case NT.AT_INDEX:
        return this.visitAtIndex(node as AtIndexNode, context);
      case NT.AT_KEY:
        return this.visitAtKey(node as AtKeyNode, context);
      default:
        throw `Runtime Error: Unrecognized node ${node}`;
    }
  }

  visitAtKey(node: AtKeyNode, context: Context): BaseValue {
    if (node.op.is(TT.DOT)) {
      const left: BaseValue = this.visit(node.left, context);
      return left.atKey(node.key.value);
    } else {
      const left = this.visit(node.left, context);
      return left instanceof NullValue
        ? new NullValue()
        : left.atKey(node.key.value);
    }
  }

  visitAtIndex(node: AtIndexNode, context: Context): BaseValue {
    return this.visit(node.left, context).atIndex(
      this.visit(node.index, context)
    );
  }

  visitMap(node: MapNode, context: Context): BaseValue {
    const mapContext = new Context(null);
    for (const it of node.map) {
      const key: string = this.visit(it.key, context).toString().value;
      const value: BaseValue = this.visit(it.value, context);
      mapContext.Declare(key, new VariableSymbol(false, BaseTypes.auto, value));
    }
    return new MapValue(mapContext);
  }

  visitList(node: ListNode, context: Context): BaseValue {
    const ctx = new Context(null);
    node.items.forEach((n, index) => {
      const value = this.visit(n, context);
      ctx.Declare(
        index.toString(),
        new VariableSymbol(false, BaseTypes.auto, value)
      );
    });
    return new ListValue(new ListContext(ctx));
  }

  visitTernary(node: TernaryNode, context: Context): BaseValue {
    if (this.visit(node.condition, context).isTren()) {
      return this.visit(node.thenNode, context);
    } else {
      return this.visit(node.elseNode, context);
    }
  }

  visitTextSpan(node: TextSpanNode, context: Context): BaseValue {
    let result: string = "";
    for (const it of node.nodes) {
      result += this.visit(it, context).toString().value;
    }
    return new StringValue(result);
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
    context.Declare(node.name.value, new VariableSymbol(true, "fun", value));
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
      throw `${funValue.toJsString()} is not a function`;
    }
  }

  visitString(node: StringNode): BaseValue {
    return new StringValue(node.token.value);
  }

  visitFor(node: ForNode, context: Context): BaseValue {
    let result: BaseValue = new NullValue();
    context = new Context(context);
    this.visit(node.init, context);

    const outControlFlow = this.inControlFlow();
    while (true) {
      const condition: BaseValue = this.visit(node.condition, context);
      if (!condition.isTren()) break;

      result = this.visit(node.bodyNode, context);
      if (this.isContinue) {
        this.isContinue = false;
        this.visit(node.stepNode, context);
        continue;
      }

      if (this.isBreak) {
        this.isBreak = false;
        break;
      }

      this.visit(node.stepNode, context);
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
    for (const it of node.cases) {
      const condition: BaseValue = this.visit(it.condition, context);
      if (condition.isTren()) {
        return this.visit(it.then, context);
      }
    }

    if (node.elseNode) {
      return this.visit(node.elseNode, context);
    } else {
      return new NullValue();
    }
  }

  visitBlock(node: BlockNode, context: Context): BaseValue {
    if (node.blockType === BlockType.fun) {
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
    if (context.Has(name)) {
      return context.Get(name).value;
    } else {
      throw `${name} is not defined`;
    }
  }

  /**
   * a = 1
   * a += 1
   *
   * 1 = 1 // error
   * @param left
   * @param op
   * @param value
   * @param context
   * @returns
   */
  _varAssign(
    name: string,
    op: Token,
    value: BaseValue,
    context: Context
  ): BaseValue {
    if (context.Has(name)) {
      const varSymbol = context.Get(name);
      if (varSymbol.isConst) {
        throw `Assignment to constant variable.`;
      }

      if (op.is(TT.PLUS_EQ)) {
        value = varSymbol.value.add(value);
      } else if (op.is(TT.MINUS_EQ)) {
        value = varSymbol.value.sub(value);
      } else if (op.is(TT.MUL_EQ)) {
        value = varSymbol.value.mul(value);
      } else if (op.is(TT.DIV_EQ)) {
        value = varSymbol.value.mul(value);
      } else if (op.is(TT.POW_EQ)) {
        value = varSymbol.value.pow(value);
      } else if (op.is(TT.REMAINDER_EQ)) {
        value = varSymbol.value.remainder(value);
      } else if (op.is(TT.SHL_EQ)) {
        value = varSymbol.value.shl(value);
      } else if (op.is(TT.SHR_EQ)) {
        value = varSymbol.value.shr(value);
      } else if (op.is(TT.BAND_EQ)) {
        value = varSymbol.value.band(value);
      } else if (op.is(TT.XOR_EQ)) {
        value = varSymbol.value.xor(value);
      } else if (op.is(TT.BOR_EQ)) {
        value = varSymbol.value.bor(value);
      } else if (op.is(TT.AND_EQ)) {
        value = varSymbol.value.and(value);
      } else if (op.is(TT.OR_EQ)) {
        value = varSymbol.value.or(value);
      } else if (op.is(TT.NULLISH_EQ)) {
        value = varSymbol.value.nullishCoalescing(value);
      }

      if (varSymbol.type !== BaseTypes.auto) {
        const valueType: string = value.typeof();
        if (valueType !== varSymbol.type && valueType !== BaseTypes.Null) {
          throw `The ${valueType} type cannot be assigned to the ${varSymbol.type} type`;
        }
      }
      return (varSymbol.value = value);
    } else {
      throw `${name} is not defined`;
    }
  }

  // 定义变量
  visitVarDeclare(node: VarDeclareNode, context: Context): BaseValue {
    const type: string = node.type.value;

    for (const it of node.items) {
      const name: string = it.name.value;
      if (context.Has(name)) {
        // 当前作用域内，不能再次定义
        throw `Identifier '${name}' has already been declared`;
      }

      const value: BaseValue = it.value
        ? this.visit(it.value, context)
        : new NullValue();

      // check type
      // auto 能设置任意属性的value
      // null 能设置给任何变量
      const valueType: string = value.typeof();
      if (
        type !== BaseTypes.auto &&
        valueType !== BaseTypes.Null &&
        valueType !== type
      ) {
        throw `The ${valueType} type cannot be assigned to the ${type} type`;
      }

      context.Declare(name, new VariableSymbol(node.isConst, type, value));
    }

    return new NullValue();
  }

  visitUnary(node: UnaryNode, context: Context) {
    switch (node.op.type) {
      case TT.MINUS:
        return this.visit(node.node, context).mul(new IntValue(-1));
      case TT.PLUS:
        return this.visit(node.node, context);
      case TT.NOT:
        return this.visit(node.node, context).not();
      case TT.BNOT:
        return this.visit(node.node, context).bnot();

      case TT.PPLUS: // 递增
      case TT.MMINUS: // 递减
        if (node.node.id() !== NT.VarAccess) {
          throw `Invalid left-hand side expression in prefix operation`;
        }

        const varAccessNode = node.node as VarAccessNode;
        const name = varAccessNode.name.value;
        if (context.Has(name)) {
          const varSymbol = context.Get(name);
          const oldValue = varSymbol.value;
          const one = new IntValue(1);
          varSymbol.value = node.op.is(TT.PPLUS)
            ? varSymbol.value.add(one)
            : varSymbol.value.sub(one);
          return node.postOp ? oldValue : varSymbol.value;
        } else {
          throw `${name} is not defined`;
        }

      case TT.IDENTIFIER: {
        switch (node.op.value) {
          case BaseTypes.int:
            return this.visit(node.node, context).toInt();
          case BaseTypes.float:
            return this.visit(node.node, context).toFloat();
          case BaseTypes.string:
            return this.visit(node.node, context).toString();
          case BaseTypes.bool:
            return this.visit(node.node, context).toBool();
          default:
            throw `Type conversion failed ${node.op.value}`;
        }
      }
      default:
        throw `Runtime Error: Unexpected token '${node.op.type}'`;
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
      case TT.COMMA:
        return right;

      // 赋值
      case TT.EQ:
      case TT.PLUS_EQ:
      case TT.MINUS_EQ:
      case TT.MUL_EQ:
      case TT.DIV_EQ:
      case TT.POW_EQ:
      case TT.REMAINDER_EQ:
      case TT.SHL_EQ:
      case TT.SHR_EQ:
      case TT.BAND_EQ:
      case TT.XOR_EQ:
      case TT.BOR_EQ:
      case TT.AND_EQ:
      case TT.OR_EQ:
      case TT.NULLISH_EQ:
        if (node.left instanceof VarAccessNode) {
          // a = 1
          return this._varAssign(
            node.left.name.value,
            node.operator,
            right,
            context
          );
        } else if (node.left instanceof AtKeyNode) {
          // a.k = 1
          const atKeyNode = node.left;
          const leftVal = this.visit(atKeyNode.left, context);
          return this._varAssign(
            atKeyNode.key.value,
            node.operator,
            right,
            leftVal.context
          );
        } else if (node.left instanceof AtIndexNode) {
          // a['k'] = 1
          const atIndexNode = node.left;
          const leftVal = this.visit(atIndexNode.left, context);
          const index = this.visit(atIndexNode.index, context);
          return this._varAssign(
            index.toString().value,
            node.operator,
            right,
            leftVal.context
          );
        } else {
          throw `Invalid left-hand`;
        }
      default:
        break;
    }
  }

  visitBool(node: BoolNode): BaseValue {
    return new BoolValue(node.token.value === Keyword.true);
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
