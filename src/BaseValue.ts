import { Context, VariableSymbol } from "./Context";
import { Interpreter } from "./Interpreter";
import { BaseNode, FunParam } from "./BaseNode";
import { BaseTypes } from "./BaseTypes";

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

  // Conversion
  abstract toInt(): IntValue;
  abstract toFloat(): FloatValue;
  abstract toStr(): StringValue;
  abstract toBool(): BoolValue;
}

export class IntValue extends BaseValue {
  toStr(): StringValue {
    return new StringValue(this.toString());
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
  toStr(): StringValue {
    return new StringValue(this.toString());
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
  toStr(): StringValue {
    return new StringValue(this.toString());
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
  toStr(): StringValue {
    return new StringValue(this.toString());
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
  toStr(): StringValue {
    return new StringValue(this.toString());
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
  toString(): string {
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

export abstract class BaseFunctionValue extends BaseValue {
  toInt(): IntValue {
    throw new Error("Method not implemented.");
  }
  toFloat(): FloatValue {
    throw new Error("Method not implemented.");
  }
  toStr(): StringValue {
    return new StringValue(this.toString());
  }
  toBool(): BoolValue {
    return new BoolValue(true);
  }

  toString(): string {
    return `${this.returnType} ${this.name.toString()}(${this.params
      .map((it) => `${it.type} ${it.name}`)
      .toString()}) {}`;
  }
  typeof(): string {
    return "fun";
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
    throw new Error("Method not implemented.");
  }
  or(other: BaseValue): BaseValue {
    throw new Error("Method not implemented.");
  }
  nullishCoalescing(other: BaseValue): BaseValue {
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
    public params: FunParam[]
  ) {
    super();
  }

  abstract call(
    args: BaseValue[],
    context: Context,
    interpreter: Interpreter
  ): BaseValue;

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
  constructor(
    returnType: string,
    name: string,
    params: FunParam[],
    public body: BaseNode
  ) {
    super(returnType, name, params);
  }
  call(
    args: BaseValue[],
    context: Context,
    interpreter: Interpreter
  ): BaseValue {
    this.checkArgsLength(args);
    this.checkArgsType(args);

    const newContext = new Context(context);

    for (let i = 0; i < args.length; i++) {
      const arg: BaseValue = args[i];
      const param = this.params[i];
      newContext.declareVariable(
        param.name,
        new VariableSymbol(false, param.type, arg)
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
  constructor(
    returnType: string,
    name: string,
    params: FunParam[],
    public method: (context: Context, self: BuiltInFunction) => BaseValue
  ) {
    super(returnType, name, params);
  }

  call(
    args: BaseValue[],
    context: Context,
    interpreter: Interpreter
  ): BaseValue {
    this.checkArgsLength(args);
    this.checkArgsType(args);

    const newContext = new Context(context);

    for (let i = 0; i < args.length; i++) {
      const arg: BaseValue = args[i];
      const param = this.params[i];
      newContext.declareVariable(
        param.name,
        new VariableSymbol(false, param.type, arg)
      );
    }

    const value: BaseValue = this.method(newContext, this);
    if (value.typeof() !== this.returnType) {
      throw `Wrong return type`;
    }
    return value;
  }

  static print() {
    return new BuiltInFunction(
      BaseTypes.Null,
      "print",
      [{ name: "input", type: BaseTypes.auto }],
      (context, self: BuiltInFunction) => {
        console.log(context.getVariable("input").value.toString());
        return new NullValue();
      }
    );
  }

  static typeof() {
    return new BuiltInFunction(
      BaseTypes.string,
      "typeof",
      [{ type: BaseTypes.auto, name: "data" }],
      (context, self: BuiltInFunction) => {
        return new StringValue(context.getVariable("data").value.typeof());
      }
    );
  }
}
