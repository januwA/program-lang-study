import { Context, VariableSymbol } from "./Context";
import { Interpreter } from "./Interpreter";
import { BaseNode, FunParam } from "./BaseNode";
import { BaseTypes } from "./BaseTypes";

export abstract class BaseValue {
  abstract context: Context;
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

  // Conversion
  abstract toInt(): IntValue;
  abstract toFloat(): FloatValue;
  abstract toString(): StringValue;
  abstract toJsString(): string;
  abstract toBool(): BoolValue;

  abstract atIndex(index: BaseValue): BaseValue;
  abstract atKey(key: string): BaseValue;
}

export class IntValue extends BaseValue {
  context: Context = new Context(null);
  atIndex(index: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  atKey(key: string): BaseValue {
    throw new Error("Method not implemented.");
  }
  toString(): StringValue {
    return new StringValue(this.toJsString());
  }
  toInt(): IntValue {
    return this;
  }
  toFloat(): FloatValue {
    return new FloatValue(this.value);
  }
  toBool(): BoolValue {
    return new BoolValue(!!this.value);
  }
  typeof(): string {
    return BaseTypes.int;
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
    return this.value ? other : this;
  }
  or(other: BaseValue): BaseValue {
    return this.value ? this : other;
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
  toJsString(): string {
    return this.value.toString();
  }
  constructor(public value: number) {
    super();
  }
}

export class FloatValue extends BaseValue {
  context: Context = new Context(null);
  atIndex(index: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  atKey(key: string): BaseValue {
    throw new Error("Method not implemented.");
  }
  toString(): StringValue {
    return new StringValue(this.toJsString());
  }
  toInt(): IntValue {
    return new IntValue(parseInt(this.value.toString(), 10));
  }
  toFloat(): FloatValue {
    return this;
  }
  toBool(): BoolValue {
    return new BoolValue(!!this.value);
  }
  typeof(): string {
    return BaseTypes.float;
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
    return this.value ? other : this;
  }
  or(other: BaseValue): BaseValue {
    return this.value ? this : other;
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
  toJsString(): string {
    return this.value.toString();
  }
  constructor(public value: number) {
    super();
  }
}

export class BoolValue extends BaseValue {
  context: Context = new Context(null);
  atIndex(index: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  atKey(key: string): BaseValue {
    throw new Error("Method not implemented.");
  }
  toString(): StringValue {
    return new StringValue(this.toJsString());
  }
  toInt(): IntValue {
    return new IntValue(+this.value);
  }
  toFloat(): FloatValue {
    return new FloatValue(+this.value);
  }
  toBool(): BoolValue {
    return this;
  }
  isTren(): boolean {
    return this.value;
  }
  nullishCoalescing(other: BaseValue): BaseValue {
    return this;
  }
  typeof(): string {
    return BaseTypes.bool;
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
    return this.value ? other : this;
  }
  or(other: BaseValue): BaseValue {
    return this.value ? this : other;
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
  toJsString(): string {
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
  context: Context = new Context(null);
  atIndex(index: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  atKey(key: string): BaseValue {
    throw new Error("Method not implemented.");
  }
  toString(): StringValue {
    return new StringValue(this.toJsString());
  }
  toInt(): IntValue {
    return new IntValue(0);
  }
  toFloat(): FloatValue {
    return new FloatValue(0);
  }
  toBool(): BoolValue {
    return new BoolValue(false);
  }
  isTren(): boolean {
    return false;
  }
  nullishCoalescing(other: BaseValue): BaseValue {
    return other;
  }

  typeof(): string {
    return BaseTypes.Null;
  }

  toJsString(): string {
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
  context: Context = new Context(null);
  atIndex(index: BaseValue): BaseValue {
    if (index instanceof IntValue) {
      return new StringValue(this.value[index.value]);
    }

    if (index instanceof StringValue) {
      return new StringValue(this.value[index.value]);
    }
  }
  atKey(key: string): BaseValue {
    throw new Error("Method not implemented.");
  }
  toString(): StringValue {
    return new StringValue(this.value);
  }
  toInt(): IntValue {
    return new IntValue(parseInt(this.value, 10));
  }
  toFloat(): FloatValue {
    return new FloatValue(parseFloat(this.value));
  }
  toBool(): BoolValue {
    return new BoolValue(!!this.value);
  }
  toJsString(): string {
    return `"${this.value}"`;
  }
  typeof(): string {
    return BaseTypes.string;
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
    return this.value ? other : this;
  }
  or(other: BaseValue): BaseValue {
    return this.value ? this : other;
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

export abstract class BaseFunctionValue extends BaseValue {
  toInt(): IntValue {
    throw new Error("Method not implemented.");
  }
  toFloat(): FloatValue {
    throw new Error("Method not implemented.");
  }
  toString(): StringValue {
    return new StringValue(this.toJsString());
  }
  toBool(): BoolValue {
    return new BoolValue(true);
  }

  toJsString(): string {
    return `${this.returnType} ${this.name.toString()}(${this.params
      .map((it) => `${it.type} ${it.name}`)
      .toString()}) {}`;
  }
  typeof(): string {
    return BaseTypes.fun;
  }
  not(): BoolValue {
    throw new Error("Method not implemented.");
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
    return other;
  }
  or(other: BaseValue): BaseValue {
    return this;
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
    return new BoolValue(this === other);
  }
  ne(other: BaseValue): BoolValue {
    return new BoolValue(this !== other);
  }
  isTren(): boolean {
    return false;
  }

  constructor(
    public returnType: string,
    public name: string,
    public params: FunParam[],
    public context: Context
  ) {
    super();
  }

  abstract call(args: BaseValue[], interpreter: Interpreter): BaseValue;

  protected checkArgsLength(args: BaseValue[]) {
    if (args.length < this.params.length) {
      throw `Too few parameters in the function call`;
    } else if (args.length > this.params.length) {
      throw `Too many parameters in the function call`;
    }
  }

  protected checkArgsType(args: BaseValue[]) {
    for (let i = 0; i < args.length; i++) {
      const arg: BaseValue = args[i];
      const param = this.params[i];
      if (param.type !== BaseTypes.auto && param.type !== arg.typeof()) {
        throw `Parameter type error`;
      }
    }
  }
}

export class FunctionValue extends BaseFunctionValue {
  atIndex(index: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  atKey(key: string): BaseValue {
    throw new Error("Method not implemented.");
  }
  constructor(
    returnType: string,
    name: string,
    params: FunParam[],
    public body: BaseNode,
    context: Context
  ) {
    super(returnType, name, params, context);
  }
  call(args: BaseValue[], interpreter: Interpreter): BaseValue {
    this.checkArgsLength(args);
    this.checkArgsType(args);

    const newContext = new Context(this.context);

    for (let i = 0; i < args.length; i++) {
      const arg: BaseValue = args[i];
      const param: FunParam = this.params[i];
      newContext.Declare(
        param.name,
        new VariableSymbol(param.isConst, param.type, arg)
      );
    }

    const value: BaseValue = interpreter.visit(this.body, newContext);
    if (value.typeof() !== this.returnType) {
      throw `Wrong return type: There is no conversion from "${value.typeof()}" to "${
        this.returnType
      }"`;
    }
    return value;
  }
}

export class BuiltInFunction extends BaseFunctionValue {
  atIndex(index: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  atKey(key: string): BaseValue {
    throw new Error("Method not implemented.");
  }
  constructor(
    returnType: string,
    name: string,
    params: FunParam[],
    public method: (context: Context, self: BuiltInFunction) => BaseValue,
    context: Context
  ) {
    super(returnType, name, params, context);
  }

  call(args: BaseValue[], _: Interpreter): BaseValue {
    this.checkArgsLength(args);
    this.checkArgsType(args);

    const newContext = new Context(this.context);

    for (let i = 0; i < args.length; i++) {
      const arg: BaseValue = args[i];
      const param: FunParam = this.params[i];
      newContext.Declare(
        param.name,
        new VariableSymbol(param.isConst, param.type, arg)
      );
    }

    const value: BaseValue = this.method(newContext, this);
    if (value.typeof() !== this.returnType) {
      throw `Wrong return type`;
    }
    return value;
  }

  static print(context: Context) {
    return new BuiltInFunction(
      BaseTypes.Null,
      "print",
      [{ isConst: true, name: "input", type: BaseTypes.auto }],
      (context, self: BuiltInFunction) => {
        console.log(context.Get("input").value.toJsString());
        return new NullValue();
      },
      context
    );
  }

  static typeof(context: Context) {
    return new BuiltInFunction(
      BaseTypes.string,
      "typeof",
      [{ isConst: true, type: BaseTypes.auto, name: "data" }],
      (context, self: BuiltInFunction) => {
        return new StringValue(context.Get("data").value.typeof());
      },
      context
    );
  }
}

export class ListValue extends BaseValue {
  atIndex(index: BaseValue): BaseValue {
    return this.context.Get(index.toString().value)?.value ?? new NullValue();
  }
  atKey(key: string): BaseValue {
    return this.context.Get(key)?.value ?? new NullValue();
  }
  toJsString(): string {
    let str = "";
    for (const index in this.context.parent.variables.symbols) {
      const value = this.context.parent.variables.get(index);
      str += `${value.value.toJsString()},`;
    }
    str = str.replace(/,$/, "");
    return `[${str}]`;
  }
  typeof(): string {
    return BaseTypes.List;
  }
  not(): BoolValue {
    throw new Error("Method not implemented.");
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
    return other;
  }
  or(other: BaseValue): BaseValue {
    return this;
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
    return new BoolValue(this === other);
  }
  ne(other: BaseValue): BoolValue {
    return new BoolValue(this !== other);
  }
  isTren(): boolean {
    return false;
  }
  toInt(): IntValue {
    throw new Error("Method not implemented.");
  }
  toFloat(): FloatValue {
    throw new Error("Method not implemented.");
  }
  toString(): StringValue {
    return new StringValue(this.toJsString());
  }
  toBool(): BoolValue {
    return new BoolValue(true);
  }

  constructor(public context: Context) {
    super();
  }
}

export class MapValue extends BaseValue {
  atIndex(index: BaseValue): BaseValue {
    return this.context.Get(index.toString().value).value;
  }
  atKey(key: string): BaseValue {
    const val = this.context.Get(key);
    return val ? val.value : new NullValue();
  }
  toJsString(): string {
    let str = "";
    for (const it in this.context.variables.symbols) {
      const value = this.context.variables.get(it);
      str += `${it}:${value.value.toJsString()},`;
    }
    return `map {${str}}`;
  }
  typeof(): string {
    return BaseTypes.Map;
  }
  not(): BoolValue {
    throw new Error("Method not implemented.");
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
    return other;
  }
  or(other: BaseValue): BaseValue {
    return this;
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
    return new BoolValue(this === other);
  }
  ne(other: BaseValue): BoolValue {
    return new BoolValue(this !== other);
  }
  isTren(): boolean {
    return true;
  }
  toInt(): IntValue {
    throw new Error("Method not implemented.");
  }
  toFloat(): FloatValue {
    throw new Error("Method not implemented.");
  }
  toString(): StringValue {
    return new StringValue(this.toJsString());
  }
  toBool(): BoolValue {
    return new BoolValue(true);
  }

  constructor(public context: Context) {
    super();
  }
}
