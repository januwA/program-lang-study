import { BaseValue } from "./BaseValue";

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
  setVariable(name: string, value: VariableSymbol): boolean {
    if (this.variables.has(name)) {
      this.variables.set(name, value);
      return true;
    } else if (this.parent) {
      return this.parent.setVariable(name, value);
    } else {
      return false;
    }
  }

  declareVariable(name: string, value: VariableSymbol): void {
    this.variables.set(name, value);
  }

  canDeclareVariable(name: string): boolean {
    return !this.variables.has(name);
  }

  getVariable(name: string): VariableSymbol {
    return this.variables.get(name) || this.parent?.getVariable(name);
  }

  hasVariable(name: string): boolean {
    return (
      this.variables.has(name) ||
      (this.parent !== null && this.parent.hasVariable(name))
    );
  }
}
