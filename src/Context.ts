import { BaseTypes } from "./BaseTypes";
import { BaseValue, BuiltInFunction, IntValue } from "./BaseValue";

export class VariableSymbol {
  constructor(
    public isConst: boolean,
    public type: string,
    public value: BaseValue
  ) {}
}

abstract class BaseMap<T> {
  symbols: { [name: string]: T } = {};
  constructor() {}

  size(): number {
    return Object.keys(this.symbols).length;
  }

  get(name: string): T {
    return this.symbols[name];
  }

  set(name: string, value: T): void {
    this.symbols[name] = value;
  }

  has(name: string): boolean {
    return this.symbols.hasOwnProperty(name);
  }
}

export class VariableMap extends BaseMap<VariableSymbol> {}

export class Context {
  variables: VariableMap = new VariableMap();
  constructor(public parent: Context | null) {}
  Set(name: string, value: VariableSymbol): boolean {
    if (this.variables.has(name)) {
      this.variables.set(name, value);
      return true;
    } else if (this.parent) {
      return this.parent.Set(name, value);
    } else {
      return false;
    }
  }

  Declare(name: string, value: VariableSymbol): void {
    this.variables.set(name, value);
  }

  Get(name: string): VariableSymbol {
    return this.variables.get(name) || this.parent?.Get(name);
  }

  Has(name: string): boolean {
    return (
      this.variables.has(name) ||
      (this.parent !== null && this.parent.Has(name))
    );
  }
}

export class ListContext extends Context {
  constructor(parent: Context) {
    super(parent);
    this.propSize();
    this.propPush();
  }

  private propSize() {
    this.Declare(
      "size",
      new VariableSymbol(
        true,
        BaseTypes.fun,
        new BuiltInFunction(
          BaseTypes.int,
          "size",
          [],
          (ctx, self: BuiltInFunction) => {
            return new IntValue(this.parent.variables.size());
          },
          this.parent
        )
      )
    );
  }

  private propPush() {
    this.Declare(
      "push",
      new VariableSymbol(
        true,
        BaseTypes.fun,
        new BuiltInFunction(
          BaseTypes.int,
          "push",
          [{ isConst: true, name: "item", type: BaseTypes.auto }],
          (ctx, self: BuiltInFunction) => {
            const size: number = this.parent.variables.size();
            this.parent.Declare(
              size.toString(),
              new VariableSymbol(false, BaseTypes.auto, ctx.Get("item").value)
            );
            return new IntValue(size + 1);
          },
          this.parent
        )
      )
    );
  }
}
