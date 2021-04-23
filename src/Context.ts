import { BaseValue } from "./Interpreter";

export class VariableSymbol {
  private symbols: { [name: string]: BaseValue } = {};
  constructor() {}

  get(name: string): BaseValue {
    return this.symbols[name];
  }

  set(name: string, value: BaseValue): void {
    this.symbols[name] = value;
  }

  has(name: string): boolean {
    return this.symbols.hasOwnProperty(name);
  }
}

export class Context {
  private variables: VariableSymbol = new VariableSymbol();
  constructor(private parent: Context | null) {}

  setVariable(name: string, value: BaseValue): boolean {
    if (this.variables.has(name)) {
      this.variables.set(name, value);
      return true;
    } else if (this.parent) {
      return this.parent.setVariable(name, value);
    } else {
      return false;
    }
  }

  declareVariable(name: string, value: BaseValue): void {
    this.variables.set(name, value);
  }

  canDeclareVariable(name: string): boolean {
    return !this.variables.has(name);
  }

  getVariable(name: string): BaseValue {
    return this.variables.get(name) || this.parent.getVariable(name);
  }

  hasVariable(name: string): boolean {
    return (
      this.variables.has(name) ||
      (this.parent !== null && this.parent.hasVariable(name))
    );
  }
}
